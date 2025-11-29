# 테스트 설정 및 실행 프롬프트

## 목적
Prompt Lab 프로젝트의 테스트 환경 구축 및 테스트 코드 작성 가이드입니다.

---

## 1. 테스트 환경 설정

### 프롬프트

```
프로젝트에 테스트 환경을 설정해줘.

## 요구사항

### 1. 패키지 설치
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest jest-environment-jsdom

### 2. Jest 설정 파일 생성
- jest.config.js (또는 jest.config.ts)
- jest.setup.js

### 3. package.json 스크립트 추가
- "test": "jest"
- "test:watch": "jest --watch"
- "test:coverage": "jest --coverage"

### 4. 테스트 폴더 구조
src/
├── __tests__/
│   ├── components/
│   ├── app/
│   └── lib/
└── ...

### 5. 설정 요구사항
- Next.js App Router 호환
- TypeScript 지원
- Tailwind CSS 모킹
- next/navigation 모킹
```

### 예상 결과물

#### jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### jest.setup.js
```javascript
import '@testing-library/jest-dom'

// next/navigation 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko',
}))
```

---

## 2. API 테스트

### 프롬프트

```
@docs/api_spec.md 를 참고하여 API Route 테스트를 작성해줘.

## 테스트 대상

### 1. /api/auth
테스트 케이스:
- 유효한 9자리 학번으로 신규 사용자 생성
- 유효한 9자리 학번으로 기존 사용자 조회
- 9자리 미만 입력 시 400 에러
- 9자리 초과 입력 시 400 에러
- 숫자가 아닌 문자 입력 시 400 에러
- 빈 값 입력 시 400 에러

### 2. /api/progress
테스트 케이스:
- GET: 사용자 진도 조회 성공
- GET: 존재하지 않는 사용자 처리
- POST: 학습 완료 저장 성공
- POST: 유효하지 않은 lessonSlug 처리
- POST: userId 누락 시 에러

### 3. /api/user/language
테스트 케이스:
- PATCH: 언어 변경 성공 (ko → en)
- PATCH: 언어 변경 성공 (en → ko)
- PATCH: 유효하지 않은 언어 코드 에러
- PATCH: userId 누락 시 에러

### 4. /api/chat
테스트 케이스:
- POST: 정상 응답 (스트리밍)
- POST: 빈 프롬프트 에러
- POST: 4000자 초과 에러
- POST: OpenAI API 에러 처리

## 파일 위치
src/__tests__/app/api/
├── auth.test.ts
├── progress.test.ts
├── language.test.ts
└── chat.test.ts
```

### 예상 결과물 예시

#### src/__tests__/app/api/auth.test.ts
```typescript
import { POST } from '@/app/api/auth/route'
import { NextRequest } from 'next/server'

// Supabase 모킹
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { id: 'test-uuid', student_id: '202400001' }, 
            error: null 
          })
        })
      })
    })
  })
}))

describe('/api/auth', () => {
  describe('POST', () => {
    it('유효한 9자리 학번으로 사용자 생성', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '202400001' }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.userId).toBeDefined()
    })

    it('9자리 미만 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '12345678' }),
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('숫자가 아닌 문자 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '12345678a' }),
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})
```

---

## 3. 컴포넌트 테스트

### 프롬프트

```
@prompts/create-components.md 를 참고하여 컴포넌트 테스트를 작성해줘.

## 테스트 대상

### 1. IdInput 컴포넌트
테스트 케이스:
- 9자리 숫자 입력 허용
- 숫자가 아닌 문자 입력 차단
- 9자리 초과 입력 차단
- 제출 버튼 클릭 시 onSubmit 호출
- 로딩 상태에서 버튼 비활성화
- 에러 메시지 표시

### 2. LanguageToggle 컴포넌트
테스트 케이스:
- 현재 언어 표시 (ko/en)
- 클릭 시 언어 전환
- onChange 콜백 호출

### 3. LessonCard 컴포넌트
테스트 케이스:
- 제목, 설명, 시간 표시
- 완료 상태 뱃지 표시
- 클릭 시 해당 레슨으로 이동

### 4. ProgressBar 컴포넌트
테스트 케이스:
- 진행률 표시 (예: 2/4)
- 퍼센트 바 너비 계산
- 0%, 50%, 100% 케이스

### 5. PromptEditor 컴포넌트
테스트 케이스:
- 텍스트 입력 가능
- 글자 수 표시
- 최대 글자 수 제한
- 제출 버튼 클릭 시 onSubmit 호출
- 로딩 상태 표시

### 6. ResponseViewer 컴포넌트
테스트 케이스:
- 마크다운 콘텐츠 렌더링
- 스트리밍 상태 인디케이터
- 복사 버튼 동작

## 파일 위치
src/__tests__/components/
├── IdInput.test.tsx
├── LanguageToggle.test.tsx
├── LessonCard.test.tsx
├── ProgressBar.test.tsx
├── PromptEditor.test.tsx
└── ResponseViewer.test.tsx
```

### 예상 결과물 예시

#### src/__tests__/components/IdInput.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IdInput from '@/components/auth/IdInput'

describe('IdInput', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('9자리 숫자 입력을 허용한다', async () => {
    render(<IdInput onSubmit={mockOnSubmit} />)
    
    const input = screen.getByPlaceholderText(/학번|student/i)
    await userEvent.type(input, '202400001')
    
    expect(input).toHaveValue('202400001')
  })

  it('숫자가 아닌 문자 입력을 차단한다', async () => {
    render(<IdInput onSubmit={mockOnSubmit} />)
    
    const input = screen.getByPlaceholderText(/학번|student/i)
    await userEvent.type(input, '12345abcd')
    
    expect(input).toHaveValue('12345')
  })

  it('9자리 초과 입력을 차단한다', async () => {
    render(<IdInput onSubmit={mockOnSubmit} />)
    
    const input = screen.getByPlaceholderText(/학번|student/i)
    await userEvent.type(input, '1234567890')
    
    expect(input).toHaveValue('123456789')
  })

  it('유효한 입력 후 제출 시 onSubmit을 호출한다', async () => {
    render(<IdInput onSubmit={mockOnSubmit} />)
    
    const input = screen.getByPlaceholderText(/학번|student/i)
    const button = screen.getByRole('button')
    
    await userEvent.type(input, '202400001')
    await userEvent.click(button)
    
    expect(mockOnSubmit).toHaveBeenCalledWith('202400001')
  })

  it('로딩 상태에서 버튼이 비활성화된다', () => {
    render(<IdInput onSubmit={mockOnSubmit} isLoading={true} />)
    
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
  })

  it('에러 메시지를 표시한다', () => {
    render(<IdInput onSubmit={mockOnSubmit} error="Invalid ID" />)
    
    expect(screen.getByText('Invalid ID')).toBeInTheDocument()
  })
})
```

---

## 4. 유틸리티/훅 테스트

### 프롬프트

```
src/lib 폴더의 유틸리티 함수와 src/hooks 폴더의 커스텀 훅 테스트를 작성해줘.

## 테스트 대상

### 1. lib/lessons.ts
테스트 케이스:
- getLesson: 존재하는 레슨 조회
- getLesson: 존재하지 않는 레슨 처리
- getAllLessons: 전체 레슨 목록 조회
- getNextLesson: 다음 레슨 반환
- getPreviousLesson: 이전 레슨 반환
- isValidLesson: 유효한 레슨 slug 검증

### 2. lib/utils.ts
테스트 케이스:
- cn 함수: 클래스명 병합
- validateStudentId: 학번 검증
- 기타 유틸리티 함수

### 3. hooks/useAuth.ts
테스트 케이스:
- 로그인 상태 관리
- localStorage 연동
- 로그아웃 처리

### 4. hooks/useProgress.ts
테스트 케이스:
- 진도 데이터 로딩
- 레슨 완료 처리
- 에러 상태 처리

## 파일 위치
src/__tests__/
├── lib/
│   ├── lessons.test.ts
│   └── utils.test.ts
└── hooks/
    ├── useAuth.test.ts
    └── useProgress.test.ts
```

---

## 5. 통합 테스트 (E2E)

### 프롬프트

```
Playwright를 사용하여 E2E 테스트를 설정해줘.

## 요구사항

### 1. 패키지 설치
npm install -D @playwright/test

### 2. 설정 파일
playwright.config.ts 생성

### 3. 테스트 시나리오

#### 시나리오 1: 로그인 → 학습 플로우
1. 메인 페이지 접속
2. 학번 입력 (202400001)
3. 시작하기 버튼 클릭
4. 학습 목록 페이지 이동 확인
5. 첫 번째 레슨 클릭
6. 학습 콘텐츠 표시 확인
7. 완료 체크박스 클릭
8. 진도 저장 확인

#### 시나리오 2: Playground 실습 플로우
1. 로그인 완료 상태에서 시작
2. Playground 페이지 이동
3. 프롬프트 입력
4. 실행 버튼 클릭
5. 응답 표시 확인
6. 복사 버튼 동작 확인

#### 시나리오 3: 언어 전환 플로우
1. 로그인 완료 상태에서 시작
2. 기본 언어 (한국어) 확인
3. 언어 토글 클릭
4. 영어로 전환 확인
5. 페이지 새로고침 후 설정 유지 확인

## 파일 위치
e2e/
├── auth.spec.ts
├── learning.spec.ts
├── playground.spec.ts
└── language.spec.ts
```

### 예상 결과물 예시

#### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### e2e/auth.spec.ts
```typescript
import { test, expect } from '@playwright/test'

test.describe('인증 플로우', () => {
  test('유효한 학번으로 로그인 성공', async ({ page }) => {
    await page.goto('/')
    
    // 학번 입력
    await page.fill('input[type="text"]', '202400001')
    
    // 시작하기 버튼 클릭
    await page.click('button[type="submit"]')
    
    // 학습 목록 페이지로 이동 확인
    await expect(page).toHaveURL('/learn')
    
    // 레슨 카드 표시 확인
    await expect(page.locator('[data-testid="lesson-card"]')).toHaveCount(4)
  })

  test('유효하지 않은 학번으로 에러 표시', async ({ page }) => {
    await page.goto('/')
    
    // 8자리 학번 입력
    await page.fill('input[type="text"]', '12345678')
    
    // 시작하기 버튼 클릭
    await page.click('button[type="submit"]')
    
    // 에러 메시지 표시 확인
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
```

---

## 6. 테스트 실행 명령어

### package.json 스크립트
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 실행 방법

| 명령어 | 설명 |
|--------|------|
| `npm test` | 단위/통합 테스트 실행 |
| `npm run test:watch` | 파일 변경 감지 모드 |
| `npm run test:coverage` | 커버리지 리포트 생성 |
| `npm run test:e2e` | E2E 테스트 실행 |
| `npm run test:e2e:ui` | E2E 테스트 UI 모드 |
| `npm run test:all` | 전체 테스트 실행 |

---

## 7. 테스트 체크리스트

### 단위 테스트
- [ ] API Routes 테스트 완료
- [ ] 컴포넌트 테스트 완료
- [ ] 유틸리티 함수 테스트 완료
- [ ] 커스텀 훅 테스트 완료

### 통합 테스트
- [ ] 인증 플로우 테스트
- [ ] 학습 플로우 테스트
- [ ] Playground 플로우 테스트
- [ ] 언어 전환 플로우 테스트

### 커버리지 목표
- [ ] 전체 커버리지 70% 이상
- [ ] API Routes 커버리지 80% 이상
- [ ] 핵심 컴포넌트 커버리지 80% 이상

---

## 8. CI/CD 통합

### GitHub Actions 설정

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
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
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 다음 단계

1. 테스트 환경 설정 완료 후 → `npm test` 실행
2. 모든 테스트 통과 확인
3. 커버리지 리포트 검토
4. 배포 진행 (`prompts/deploy.md` 참조)
