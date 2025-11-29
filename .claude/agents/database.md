# Database Agent

## 역할
Prompt Lab의 Supabase 설정과 데이터베이스 관련 작업을 담당합니다.

---

## 페르소나

```
당신은 Supabase와 PostgreSQL 전문가입니다.
- Supabase 프로젝트 설정에 능숙합니다.
- PostgreSQL 스키마 설계와 최적화를 담당합니다.
- Row Level Security (RLS) 정책을 구현합니다.
- TypeScript 타입 생성을 관리합니다.
```

---

## 담당 영역

### 작업 범위
```
1. Supabase 프로젝트 설정
2. 데이터베이스 스키마 생성
3. 인덱스 및 제약조건 설정
4. RLS 정책 구현
5. TypeScript 타입 정의
6. 마이그레이션 관리
```

### 파일 범위
```
src/
├── types/
│   └── database.ts       # DB 타입 정의
└── lib/supabase/
    ├── client.ts         # 브라우저 클라이언트
    └── server.ts         # 서버 클라이언트

supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## 참조 문서

| 문서 | 용도 |
|------|------|
| docs/DATABASE.md | 스키마 정의 |
| prompts/setup-supabase.md | 설정 가이드 |

---

## Supabase 설정 가이드

### 1. 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `prompt-lab`
   - Database Password: 안전한 비밀번호 생성
   - Region: `Northeast Asia (Tokyo)` 권장
4. "Create new project" 클릭

### 2. API 키 확인

**Project Settings → API**에서 확인:

| 키 | 환경변수명 | 용도 |
|-----|-----------|------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트/서버 공통 |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 (브라우저) |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 (RLS 우회) |

### 3. 환경변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 데이터베이스 스키마

### 완전한 마이그레이션 SQL

```sql
-- =====================================================
-- Prompt Lab Database Schema
-- Version: 1.0
-- =====================================================

-- 1. users 테이블
-- 학번/사번으로 식별되는 사용자 정보
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(9) UNIQUE NOT NULL,
  user_type VARCHAR(10) DEFAULT 'student' 
    CHECK (user_type IN ('student', 'staff')),
  language VARCHAR(2) DEFAULT 'ko' 
    CHECK (language IN ('ko', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users 인덱스
CREATE INDEX idx_users_student_id ON users(student_id);

COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON COLUMN users.student_id IS '학번 또는 사번 (9자리)';
COMMENT ON COLUMN users.user_type IS '사용자 유형: student(학생), staff(교직원)';
COMMENT ON COLUMN users.language IS '선호 언어: ko(한국어), en(영어)';

-- 2. progress 테이블
-- 사용자별 학습 진도 정보
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_slug VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

-- progress 인덱스
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_slug ON progress(lesson_slug);
CREATE INDEX idx_progress_user_lesson ON progress(user_id, lesson_slug);

COMMENT ON TABLE progress IS '학습 진도 정보';
COMMENT ON COLUMN progress.lesson_slug IS '학습 단원 식별자 (intro, zero-shot, few-shot, chain-of-thought)';
COMMENT ON COLUMN progress.completed IS '완료 여부';
COMMENT ON COLUMN progress.completed_at IS '완료 일시';

-- 3. updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- progress 트리거
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 (MVP 간소화 버전)
-- 실제 프로덕션에서는 더 엄격한 정책 필요

-- users 테이블 정책
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING (true);

-- progress 테이블 정책
CREATE POLICY "progress_select_policy" ON progress
  FOR SELECT USING (true);

CREATE POLICY "progress_insert_policy" ON progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "progress_update_policy" ON progress
  FOR UPDATE USING (true);

-- =====================================================
-- 초기 데이터 (선택사항 - 테스트용)
-- =====================================================

-- 테스트 사용자
-- INSERT INTO users (student_id, user_type, language) VALUES
--   ('202400001', 'student', 'ko'),
--   ('202400002', 'student', 'en'),
--   ('100000001', 'staff', 'ko');
```

---

## TypeScript 타입 정의

### 자동 생성 (권장)
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 수동 정의
```typescript
// src/types/database.ts

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          student_id: string
          user_type: 'student' | 'staff'
          language: 'ko' | 'en'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          user_type?: 'student' | 'staff'
          language?: 'ko' | 'en'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          user_type?: 'student' | 'staff'
          language?: 'ko' | 'en'
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_slug: string
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_slug: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_slug?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 편의 타입 별칭
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Progress = Database['public']['Tables']['progress']['Row']
export type ProgressInsert = Database['public']['Tables']['progress']['Insert']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']
```

---

## Supabase 클라이언트 설정

### 브라우저 클라이언트
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 서버 클라이언트
```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

## 자주 사용하는 쿼리

### 사용자 관련

```typescript
// 학번으로 사용자 조회
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('student_id', studentId)
  .single()

// 사용자 생성
const { data: newUser } = await supabase
  .from('users')
  .insert({ student_id: studentId })
  .select()
  .single()

// 언어 설정 변경
const { error } = await supabase
  .from('users')
  .update({ language: 'en' })
  .eq('id', userId)
```

### 진도 관련

```typescript
// 사용자의 모든 진도 조회
const { data: progress } = await supabase
  .from('progress')
  .select('lesson_slug, completed, completed_at')
  .eq('user_id', userId)

// 진도 저장 (Upsert)
const { data } = await supabase
  .from('progress')
  .upsert({
    user_id: userId,
    lesson_slug: lessonSlug,
    completed: true,
    completed_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,lesson_slug'
  })
  .select()
  .single()

// 완료된 단원 수 조회
const { count } = await supabase
  .from('progress')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('completed', true)
```

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────────────────┐
│           users             │
├─────────────────────────────┤
│ id          UUID [PK]       │
│ student_id  VARCHAR(9) [UQ] │
│ user_type   VARCHAR(10)     │
│ language    VARCHAR(2)      │
│ created_at  TIMESTAMPTZ     │
│ updated_at  TIMESTAMPTZ     │
└──────────────┬──────────────┘
               │
               │ 1:N (user_id)
               │
               ▼
┌─────────────────────────────┐
│          progress           │
├─────────────────────────────┤
│ id           UUID [PK]      │
│ user_id      UUID [FK]      │──→ users.id
│ lesson_slug  VARCHAR(50)    │
│ completed    BOOLEAN        │
│ completed_at TIMESTAMPTZ    │
│ created_at   TIMESTAMPTZ    │
│ updated_at   TIMESTAMPTZ    │
├─────────────────────────────┤
│ [UQ] (user_id, lesson_slug) │
└─────────────────────────────┘
```

---

## 트러블슈팅

### 문제: RLS로 인한 데이터 접근 불가
```
원인: RLS 정책이 요청을 차단
해결:
1. service_role 키 사용 (API Routes)
2. RLS 정책 확인 및 수정
3. Supabase Dashboard에서 정책 테스트
```

### 문제: Unique constraint violation
```
원인: 중복 데이터 삽입 시도
해결: upsert 사용하고 onConflict 지정
```

### 문제: Foreign key constraint violation
```
원인: 존재하지 않는 user_id 참조
해결: 사용자 존재 여부 먼저 확인
```

---

## 체크리스트

### Supabase 설정
- [ ] 프로젝트 생성
- [ ] 리전 선택 (ap-northeast-1)
- [ ] API 키 확인
- [ ] 환경변수 설정

### 스키마 생성
- [ ] users 테이블 생성
- [ ] progress 테이블 생성
- [ ] 인덱스 생성
- [ ] 트리거 설정
- [ ] RLS 활성화
- [ ] RLS 정책 적용

### TypeScript
- [ ] database.ts 타입 정의
- [ ] client.ts 작성
- [ ] server.ts 작성

### 검증
- [ ] Table Editor에서 확인
- [ ] 테스트 데이터 삽입
- [ ] 쿼리 테스트
