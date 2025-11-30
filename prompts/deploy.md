# 배포 설정 및 실행 프롬프트

## 목적
Prompt Lab 프로젝트의 배포 환경 구축 및 프로덕션 배포 가이드입니다.

---

## 1. 배포 전 준비

### 프롬프트

```
프로젝트 배포 전 준비 작업을 진행해줘.

## 요구사항

### 1. 환경변수 검증
- .env.local과 .env.example 비교
- 필수 환경변수 누락 확인
- Production용 환경변수 목록 정리

### 2. 빌드 테스트
- npm run build 실행
- 빌드 에러 수정
- 번들 크기 확인

### 3. 타입 검사
- npx tsc --noEmit 실행
- 타입 에러 수정

### 4. 린트 검사
- npm run lint 실행
- 린트 에러/경고 수정
```

### 환경변수 체크리스트

```env
# .env.example - 배포 시 필요한 환경변수

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# OpenAI (필수)
OPENAI_API_KEY=sk-xxxxx

# App (필수)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 2. Vercel 배포 설정

### 프롬프트

```
@docs/tech_spec.md 섹션 10을 참고하여 Vercel 배포를 설정해줘.

## 요구사항

### 1. vercel.json 생성
- 빌드 명령어 설정
- 출력 디렉토리 설정
- 리다이렉트/리라이트 규칙 (필요 시)

### 2. 환경변수 설정 가이드
- Vercel Dashboard 설정 방법
- 환경별 (Production/Preview/Development) 구분

### 3. 도메인 설정
- 기본 Vercel 도메인
- 커스텀 도메인 설정 방법
```

### 예상 결과물

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://prompt-lab.vercel.app"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    }
  ]
}
```

---

## 3. Supabase 프로덕션 설정

### 프롬프트

```
Supabase 프로덕션 환경을 설정해줘.

## 요구사항

### 1. 프로덕션 프로젝트 생성
- Supabase Dashboard에서 새 프로젝트 생성
- 리전 선택 (Northeast Asia - ap-northeast-1 권장)

### 2. 데이터베이스 마이그레이션
- 로컬 마이그레이션 파일을 프로덕션에 적용
- supabase db push 또는 SQL Editor 사용

### 3. RLS 정책 확인
- users 테이블 RLS 활성화
- progress 테이블 RLS 활성화
- 정책 규칙 테스트

### 4. API 키 확보
- anon key (클라이언트용)
- service_role key (서버용)
```

### Supabase 프로덕션 체크리스트

```markdown
## Supabase 프로덕션 설정 체크리스트

### 프로젝트 설정
- [ ] 프로덕션용 새 프로젝트 생성
- [ ] 리전: Northeast Asia (Seoul) 선택
- [ ] 강력한 데이터베이스 비밀번호 설정

### 데이터베이스
- [ ] 마이그레이션 적용 완료
- [ ] users 테이블 생성 확인
- [ ] progress 테이블 생성 확인
- [ ] 인덱스 생성 확인

### 보안
- [ ] RLS 활성화 (모든 테이블)
- [ ] RLS 정책 설정 완료
- [ ] service_role key 안전하게 보관

### API 키
- [ ] NEXT_PUBLIC_SUPABASE_URL 확보
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 확보
- [ ] SUPABASE_SERVICE_ROLE_KEY 확보
```

---

## 4. 배포 실행

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포 (Preview)
vercel

# 배포 (Production)
vercel --prod
```

### 방법 2: GitHub 연동 (권장)

```
Vercel과 GitHub를 연동하여 자동 배포를 설정해줘.

## 단계

### 1. Vercel 프로젝트 생성
- vercel.com 접속 → New Project
- GitHub 저장소 Import

### 2. 환경변수 설정
- Project Settings → Environment Variables
- Production/Preview/Development 환경별 설정

### 3. 빌드 설정 확인
- Framework Preset: Next.js
- Build Command: npm run build
- Output Directory: .next

### 4. 배포 트리거
- main 브랜치: Production 자동 배포
- 기타 브랜치: Preview 자동 배포
- PR 생성 시: Preview 배포
```

---

## 5. 배포 후 검증

### 프롬프트

```
배포 완료 후 프로덕션 환경을 검증해줘.

## 검증 항목

### 1. 기능 테스트
- 로그인 플로우 (학번 입력 → 학습 목록)
- 학습 플로우 (레슨 조회 → 완료 체크)
- Playground 플로우 (프롬프트 입력 → 응답)
- 언어 전환 (한국어 ↔ 영어)

### 2. API 테스트
- /api/auth 정상 응답
- /api/progress 정상 응답
- /api/chat 스트리밍 응답

### 3. 성능 테스트
- Lighthouse 점수 확인
- Core Web Vitals 확인
- 모바일 성능 확인

### 4. 보안 테스트
- HTTPS 적용 확인
- API 키 노출 여부 (개발자 도구)
- 에러 메시지 정보 노출 확인
```

### 배포 후 체크리스트

```markdown
## 프로덕션 배포 후 체크리스트

### 기능 검증
- [ ] 메인 페이지 로딩
- [ ] 학번 로그인 성공
- [ ] 학습 목록 표시
- [ ] 레슨 콘텐츠 로딩
- [ ] 실습 프롬프트 실행
- [ ] 학습 완료 저장
- [ ] Playground 동작
- [ ] 언어 전환 동작

### API 검증
- [ ] POST /api/auth 정상
- [ ] GET /api/progress 정상
- [ ] POST /api/progress 정상
- [ ] PATCH /api/user/language 정상
- [ ] POST /api/chat 스트리밍 정상

### 성능 검증
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### 보안 검증
- [ ] HTTPS 적용됨
- [ ] API 키 클라이언트 노출 없음
- [ ] 에러 시 민감 정보 노출 없음
- [ ] RLS 정책 동작 확인
```

---

## 6. 모니터링 설정

### 프롬프트

```
프로덕션 모니터링을 설정해줘.

## 요구사항

### 1. Vercel Analytics (기본)
- 페이지뷰 추적
- Web Vitals 모니터링
- 사용량 대시보드

### 2. 에러 모니터링 (선택)
- Sentry 연동
- 에러 알림 설정

### 3. 로그 모니터링
- Vercel Logs 활용
- API 에러 로그 확인
```

### Vercel Analytics 설정

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 7. 롤백 절차

### 문제 발생 시 롤백

```bash
# Vercel CLI로 이전 배포로 롤백
vercel rollback

# 또는 Vercel Dashboard에서
# Deployments → 이전 배포 선택 → Promote to Production
```

### 롤백 체크리스트

```markdown
## 롤백 절차

### 1. 문제 확인
- [ ] 에러 로그 확인
- [ ] 영향 범위 파악
- [ ] 롤백 필요 여부 결정

### 2. 롤백 실행
- [ ] Vercel Dashboard 접속
- [ ] Deployments 탭 이동
- [ ] 정상 동작하던 배포 선택
- [ ] "Promote to Production" 클릭

### 3. 롤백 후 확인
- [ ] 서비스 정상 동작 확인
- [ ] 에러 해결 확인
- [ ] 사용자 공지 (필요 시)

### 4. 후속 조치
- [ ] 문제 원인 분석
- [ ] 수정 후 재배포
```

---

## 8. CI/CD 파이프라인

### GitHub Actions 설정

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      # Vercel 자동 배포 사용 시 아래 단계 생략 가능
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. 환경별 설정 요약

### 환경변수 매트릭스

| 환경변수 | Development | Preview | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 로컬/개발 URL | 개발 URL | 프로덕션 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 개발 키 | 개발 키 | 프로덕션 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 개발 키 | 개발 키 | 프로덕션 키 |
| `OPENAI_API_KEY` | 개발 키 | 개발 키 | 프로덕션 키 |
| `NEXT_PUBLIC_APP_URL` | localhost:3000 | Vercel Preview URL | 프로덕션 도메인 |

---

## 10. 배포 명령어 요약

| 단계 | 명령어 | 설명 |
|------|--------|------|
| 빌드 테스트 | `npm run build` | 프로덕션 빌드 |
| 로컬 프로덕션 | `npm run start` | 빌드 결과 로컬 실행 |
| Preview 배포 | `vercel` | Vercel Preview 배포 |
| Production 배포 | `vercel --prod` | Vercel Production 배포 |
| 롤백 | `vercel rollback` | 이전 버전으로 롤백 |

---

## 다음 단계

1. 배포 전 준비 완료 확인
2. Vercel 프로젝트 생성 및 환경변수 설정
3. GitHub 연동 또는 CLI로 배포
4. 배포 후 검증 체크리스트 수행
5. 모니터링 설정 (선택)
