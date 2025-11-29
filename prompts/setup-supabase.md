# Supabase 설정 프롬프트

## 목적
Supabase 프로젝트를 설정하고, 데이터베이스 스키마를 생성하며, 클라이언트 코드를 작성합니다.

---

## 프롬프트

```
당신은 Supabase 전문가입니다. Prompt Lab 프로젝트를 위한 Supabase 설정을 완료해주세요.

## 참조 문서
- DATABASE.md: 스키마 정의 및 RLS 정책

## 작업 1: 데이터베이스 스키마 생성

Supabase SQL Editor에서 실행할 마이그레이션 SQL을 생성해주세요:

### 테이블 구조
1. **users 테이블**
   - id: UUID (PK)
   - student_id: VARCHAR(9) (UNIQUE, NOT NULL) - 학번/사번
   - user_type: VARCHAR(10) - 'student' | 'staff'
   - language: VARCHAR(2) - 'ko' | 'en'
   - created_at, updated_at: TIMESTAMPTZ

2. **progress 테이블**
   - id: UUID (PK)
   - user_id: UUID (FK → users)
   - lesson_slug: VARCHAR(50)
   - completed: BOOLEAN
   - completed_at: TIMESTAMPTZ
   - created_at, updated_at: TIMESTAMPTZ
   - UNIQUE(user_id, lesson_slug)

### 요구사항
- 인덱스 생성 (student_id, user_id, lesson_slug)
- updated_at 자동 갱신 트리거
- RLS 활성화 및 정책 설정 (MVP용 간소화 버전)

## 작업 2: TypeScript 타입 정의

`src/types/database.ts` 파일을 생성하고 다음 타입을 정의해주세요:
- Database 인터페이스 (Supabase 제네릭용)
- User, UserInsert, UserUpdate 타입
- Progress, ProgressInsert, ProgressUpdate 타입

## 작업 3: Supabase 클라이언트 생성

### 브라우저 클라이언트
`src/lib/supabase/client.ts`:
- @supabase/ssr의 createBrowserClient 사용
- Database 타입 적용

### 서버 클라이언트
`src/lib/supabase/server.ts`:
- @supabase/supabase-js의 createClient 사용
- service_role 키 사용 (API Routes용)
- Database 타입 적용

## 출력
1. 완전한 마이그레이션 SQL 스크립트
2. src/types/database.ts 파일 전체 코드
3. src/lib/supabase/client.ts 파일 전체 코드
4. src/lib/supabase/server.ts 파일 전체 코드
```

---

## 예상 결과물

### 1. 마이그레이션 SQL (supabase_migration.sql)
```sql
-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(9) UNIQUE NOT NULL,
  user_type VARCHAR(10) DEFAULT 'student' CHECK (user_type IN ('student', 'staff')),
  language VARCHAR(2) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_student_id ON users(student_id);

-- progress 테이블
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

CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_slug ON progress(lesson_slug);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (MVP 간소화)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for progress" ON progress FOR ALL USING (true);
```

### 2. src/types/database.ts
```typescript
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
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Progress = Database['public']['Tables']['progress']['Row']
export type ProgressInsert = Database['public']['Tables']['progress']['Insert']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']
```

### 3. src/lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4. src/lib/supabase/server.ts
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

## Supabase 설정 체크리스트

- [ ] Supabase 프로젝트 생성 (https://supabase.com)
- [ ] 리전 선택: ap-northeast-1 (Tokyo) 권장
- [ ] Project Settings → API에서 키 확인
  - [ ] Project URL → NEXT_PUBLIC_SUPABASE_URL
  - [ ] anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] service_role → SUPABASE_SERVICE_ROLE_KEY
- [ ] SQL Editor에서 마이그레이션 실행
- [ ] Table Editor에서 테이블 생성 확인
- [ ] .env.local에 환경변수 설정

---

## 다음 단계
- `create-components.md`: UI 컴포넌트 생성
- `create-api.md`: API 라우트 생성
