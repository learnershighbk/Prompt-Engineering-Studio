# Supabase 프로덕션 설정 체크리스트

생성일: 2025-01-27  
참고: `prompts/deploy.md` 섹션 3

---

## 📋 프로젝트 설정

### 1. 프로덕션 프로젝트 생성
- [ ] Supabase Dashboard (https://supabase.com) 접속
- [ ] "New Project" 클릭하여 새 프로젝트 생성
- [ ] 프로젝트 이름: `prompt-lab-production` (또는 원하는 이름)
- [ ] **리전 선택: Northeast Asia (Seoul) - ap-northeast-1** ⚠️ 중요
- [ ] 강력한 데이터베이스 비밀번호 설정 (안전하게 보관)
- [ ] 프로젝트 생성 완료 대기 (약 2-3분)

---

## 🗄️ 데이터베이스 마이그레이션

### 2. 마이그레이션 파일 확인
현재 프로젝트의 마이그레이션 파일:
- ✅ `supabase/migrations/0001_create_example_table.sql` - 예시 테이블
- ✅ `supabase/migrations/0002_create_users_and_progress.sql` - users, progress 테이블

### 3. 마이그레이션 적용 방법

#### 방법 A: Supabase Dashboard SQL Editor 사용 (권장)
1. [ ] Supabase Dashboard → SQL Editor 접속
2. [ ] `0001_create_example_table.sql` 파일 내용 복사 후 실행
3. [ ] `0002_create_users_and_progress.sql` 파일 내용 복사 후 실행
4. [ ] 각 마이그레이션 실행 후 에러 확인

#### 방법 B: Supabase CLI 사용 (선택적)
```bash
# Supabase CLI 설치 (미설치 시)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

### 4. 테이블 생성 확인
- [ ] `example` 테이블 생성 확인
  - Table Editor → `public.example` 테이블 존재 확인
- [ ] `users` 테이블 생성 확인
  - Table Editor → `public.users` 테이블 존재 확인
  - 컬럼 확인: `id`, `student_id`, `user_type`, `language`, `created_at`, `updated_at`
- [ ] `progress` 테이블 생성 확인
  - Table Editor → `public.progress` 테이블 존재 확인
  - 컬럼 확인: `id`, `user_id`, `lesson_slug`, `completed`, `completed_at`, `created_at`, `updated_at`

### 5. 인덱스 생성 확인
- [ ] `idx_users_student_id` 인덱스 확인 (users.student_id)
- [ ] `idx_progress_user_id` 인덱스 확인 (progress.user_id)
- [ ] `idx_progress_lesson_slug` 인덱스 확인 (progress.lesson_slug)
- [ ] `idx_progress_user_lesson` 복합 인덱스 확인 (progress.user_id, progress.lesson_slug)

### 6. 트리거 및 함수 확인
- [ ] `update_updated_at_column()` 함수 생성 확인
- [ ] `update_users_updated_at` 트리거 확인
- [ ] `update_progress_updated_at` 트리거 확인

---

## 🔒 보안 설정

### 7. RLS (Row Level Security) 설정
**⚠️ 중요: 프로젝트 가이드라인에 따라 RLS는 사용하지 않습니다.**

- [ ] `users` 테이블 RLS 비활성화 확인
  - SQL: `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
- [ ] `progress` 테이블 RLS 비활성화 확인
  - SQL: `ALTER TABLE public.progress DISABLE ROW LEVEL SECURITY;`
- [ ] `example` 테이블 RLS 비활성화 확인

**참고:** 프로젝트는 서버 사이드에서 service_role 키를 사용하여 접근 제어를 관리합니다.

### 8. API 키 보안
- [ ] `service_role` 키를 안전하게 보관 (절대 클라이언트에 노출 금지)
- [ ] 환경변수에만 저장하고 Git에 커밋하지 않음 확인
- [ ] Vercel Dashboard에만 환경변수로 설정

---

## 🔑 API 키 확보

### 9. Supabase 프로젝트 설정에서 API 키 확인
1. [ ] Supabase Dashboard → Project Settings → API 접속
2. [ ] **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL` 및 `SUPABASE_URL`에 사용
3. [ ] **anon public** 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
4. [ ] **service_role** 키 복사 → `SUPABASE_SERVICE_ROLE_KEY`에 사용
   - ⚠️ **주의:** service_role 키는 서버 사이드에서만 사용

### 10. 환경변수 설정 확인
다음 환경변수들이 준비되었는지 확인:

```env
# 클라이언트용 (NEXT_PUBLIC_ 접두사)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# 서버용 (NEXT_PUBLIC_SUPABASE_URL과 동일한 값)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

---

## ✅ 검증 테스트

### 11. 데이터베이스 연결 테스트
- [ ] Supabase Dashboard → Table Editor에서 테이블 조회 가능 확인
- [ ] SQL Editor에서 다음 쿼리 실행하여 테이블 존재 확인:
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('example', 'users', 'progress');
  ```

### 12. 인덱스 확인
- [ ] 다음 쿼리로 인덱스 확인:
  ```sql
  SELECT indexname, tablename 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('users', 'progress')
  ORDER BY tablename, indexname;
  ```

### 13. 외래 키 제약 조건 확인
- [ ] `progress.user_id` → `users.id` 외래 키 제약 조건 확인:
  ```sql
  SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'progress';
  ```

---

## 📝 마이그레이션 파일 목록

프로덕션에 적용해야 할 마이그레이션 파일:

1. **0001_create_example_table.sql**
   - `example` 테이블 생성
   - 예시 데이터 삽입

2. **0002_create_users_and_progress.sql**
   - `users` 테이블 생성
   - `progress` 테이블 생성
   - 인덱스 생성
   - `updated_at` 자동 갱신 트리거 설정
   - RLS 비활성화

---

## 🚀 다음 단계

Supabase 프로덕션 설정이 완료되면:

1. ✅ 환경변수 확인 완료
2. ✅ Vercel Dashboard에 환경변수 설정
3. ✅ 배포 후 데이터베이스 연결 테스트

---

## ⚠️ 주의사항

1. **RLS 사용 안 함**: 프로젝트 가이드라인에 따라 RLS는 비활성화되어 있습니다.
2. **service_role 키 보안**: 절대 클라이언트 사이드 코드나 환경변수 파일에 노출하지 마세요.
3. **리전 선택**: 한국 사용자를 위해 Northeast Asia (Seoul) 리전을 선택하세요.
4. **마이그레이션 순서**: 마이그레이션 파일은 번호 순서대로 적용해야 합니다.

---

## 📚 참고 자료

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Supabase API 키 관리](https://supabase.com/docs/guides/api/api-keys)
