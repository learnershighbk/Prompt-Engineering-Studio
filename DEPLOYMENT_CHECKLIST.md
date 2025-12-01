# 배포 전 준비 체크리스트

생성일: 2025-01-27

## ✅ 검증 완료 항목

### 1. 환경변수 검증 ✅

#### .env.local vs .env.example 비교 결과

**✅ 설정된 환경변수:**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ANTHROPIC_API_KEY` ✅

**⚠️ 누락된 환경변수:**
- `NEXT_PUBLIC_APP_URL` - 로컬 개발에는 선택적이지만 Production 배포 시 필요

**📝 참고사항:**
- 프로젝트는 `ANTHROPIC_API_KEY`를 사용하며, `OPENAI_API_KEY`는 사용하지 않음
- `.env.example`에 `OPENAI_API_KEY`가 명시되어 있으나 실제 코드에서는 사용되지 않음
- `.env.example` 업데이트 권장: `OPENAI_API_KEY` → `ANTHROPIC_API_KEY`

### 2. 빌드 테스트 ✅

```bash
npm run build
```

**결과:** ✅ 성공
- 빌드 에러 없음
- 번들 생성 완료

### 3. 타입 검사 ✅

```bash
npx tsc --noEmit
```

**결과:** ✅ 성공
- 타입 에러 없음
- 모든 타입 정의 정상

### 4. 린트 검사 ✅

```bash
npm run lint
```

**결과:** ✅ 성공
- 린트 에러 없음
- 코드 스타일 준수 확인

---

## 📋 Production용 환경변수 목록

Vercel Dashboard의 Environment Variables에 다음 변수들을 설정해야 합니다:

### 필수 환경변수 (Production)

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Anthropic (필수)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App (필수)
NEXT_PUBLIC_APP_URL=https://prompt-lab.vercel.app
```

### 환경별 설정 가이드

| 환경변수 | Development | Preview | Production |
|---------|-------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 개발 프로젝트 URL | 개발 프로젝트 URL | 프로덕션 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 개발 anon key | 개발 anon key | 프로덕션 anon key |
| `SUPABASE_URL` | 개발 프로젝트 URL | 개발 프로젝트 URL | 프로덕션 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 개발 service role key | 개발 service role key | 프로덕션 service role key |
| `ANTHROPIC_API_KEY` | 개발 키 | 개발 키 | 프로덕션 키 |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Vercel 자동 생성 | `https://prompt-lab.vercel.app` |

---

## 🔧 권장 사항

### 1. .env.example 업데이트

`.env.example` 파일을 실제 사용하는 환경변수에 맞게 업데이트:

```env
# .env.example - 배포 시 필요한 환경변수

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Anthropic (필수)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App (필수)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2. 로컬 개발 환경변수

로컬 개발 시 `.env.local`에 `NEXT_PUBLIC_APP_URL` 추가 (선택적):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ 배포 준비 완료

모든 검증 항목이 통과되었습니다. 다음 단계로 진행할 수 있습니다:

1. ✅ 환경변수 검증 완료
2. ✅ 빌드 테스트 통과
3. ✅ 타입 검사 통과
4. ✅ 린트 검사 통과

**다음 단계:** Vercel 배포 설정 및 환경변수 구성
