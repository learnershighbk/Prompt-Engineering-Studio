# Supabase 프로덕션 설정 체크리스트

> 참고: `prompts/deploy.md` 섹션 3 기준

## 프로젝트 설정

- [ ] 프로덕션용 새 프로젝트 생성
- [ ] 리전: Northeast Asia (Seoul) 선택
- [ ] 강력한 데이터베이스 비밀번호 설정

## 데이터베이스

- [ ] 마이그레이션 적용 완료
  - [ ] `0001_create_example_table.sql` 적용
  - [ ] `0002_create_users_and_progress.sql` 적용
- [ ] 테이블 생성 확인
  - [ ] `example` 테이블 생성 확인
  - [ ] `users` 테이블 생성 확인
  - [ ] `progress` 테이블 생성 확인
- [ ] 인덱스 생성 확인
  - [ ] `idx_users_student_id` 확인
  - [ ] `idx_progress_user_id` 확인
  - [ ] `idx_progress_lesson_slug` 확인
  - [ ] `idx_progress_user_lesson` 확인
- [ ] 트리거 생성 확인
  - [ ] `update_users_updated_at` 트리거 확인
  - [ ] `update_progress_updated_at` 트리거 확인
- [ ] 확장(Extension) 확인
  - [ ] `pgcrypto` 확장 활성화 확인

## 보안

> ⚠️ **중요**: 프로젝트 가이드라인에 따라 RLS는 사용하지 않습니다.
> 마이그레이션 파일에서 명시적으로 RLS를 비활성화하고 있습니다.

- [ ] RLS 비활성화 확인 (모든 테이블)
  - [ ] `users` 테이블 RLS 비활성화 확인
  - [ ] `progress` 테이블 RLS 비활성화 확인
  - [ ] `example` 테이블 RLS 비활성화 확인
- [ ] `service_role` key 안전하게 보관
  - [ ] 환경변수에만 저장 (코드에 하드코딩 금지)
  - [ ] Vercel 환경변수에 설정

## API 키

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 확보
  - [ ] Supabase Dashboard → Settings → API → Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확보
  - [ ] Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 확보
  - [ ] Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
  - [ ] ⚠️ 절대 클라이언트에 노출하지 않음

## 마이그레이션 적용 방법

### 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

1. Supabase Dashboard 접속
2. SQL Editor 메뉴 선택
3. 각 마이그레이션 파일 내용을 순서대로 실행:
   - `supabase/migrations/0001_create_example_table.sql`
   - `supabase/migrations/0002_create_users_and_progress.sql`
4. 실행 결과 확인

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (미설치 시)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

## 검증 쿼리

마이그레이션 적용 후 다음 쿼리로 확인:

```sql
-- 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('example', 'users', 'progress');

-- 인덱스 확인
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'progress');

-- 트리거 확인
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'progress');

-- RLS 상태 확인 (모두 비활성화되어야 함)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('example', 'users', 'progress');
```

## 현재 프로젝트 마이그레이션 파일

### 0001_create_example_table.sql
- `example` 테이블 생성
- RLS 비활성화

### 0002_create_users_and_progress.sql
- `users` 테이블 생성
- `progress` 테이블 생성
- 인덱스 생성
- `updated_at` 자동 갱신 트리거
- RLS 비활성화

## 다음 단계

1. ✅ Supabase 프로덕션 프로젝트 생성
2. ✅ 마이그레이션 적용
3. ✅ API 키 확보 및 Vercel 환경변수 설정
4. ✅ 배포 실행 (섹션 4)
