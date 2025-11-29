# Technical Specification

## 프로젝트명
Prompt Lab - Prompt Engineering 학습 플랫폼

---

## 1. 시스템 아키텍처

### 1.1 전체 구조
```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Login     │  │   Learn     │  │  Playground │     │
│  │   Page      │  │   Pages     │  │    Page     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Next.js)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js App Router                  │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │  Pages   │  │   API    │  │  Static  │      │   │
│  │  │ (SSR)    │  │  Routes  │  │  Assets  │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
┌───────────────────────┐   ┌───────────────────────┐
│      Supabase         │   │     OpenAI API        │
│                       │   │                       │
│  ┌─────────────────┐  │   │  ┌─────────────────┐  │
│  │   PostgreSQL    │  │   │  │   GPT-4o-mini   │  │
│  │                 │  │   │  │   / GPT-4o      │  │
│  │  - users        │  │   │  └─────────────────┘  │
│  │  - progress     │  │   │                       │
│  └─────────────────┘  │   └───────────────────────┘
│                       │
│  ┌─────────────────┐  │
│  │   Row Level     │  │
│  │   Security      │  │
│  └─────────────────┘  │
└───────────────────────┘
```

### 1.2 기술 스택 상세

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Framework | Next.js | 14.x | App Router, SSR, API Routes |
| Language | TypeScript | 5.x | 타입 안정성 |
| Styling | Tailwind CSS | 3.x | 유틸리티 기반 스타일링 |
| UI Components | Headless UI | 2.x | 접근성 지원 컴포넌트 |
| Database | PostgreSQL | 15.x | Supabase 제공 |
| ORM/Client | Supabase JS | 2.x | DB 클라이언트 |
| AI | OpenAI API | v1 | GPT 모델 호출 |
| i18n | next-intl | 3.x | 다국어 지원 |
| Deployment | Vercel | - | 호스팅, CI/CD |

---

## 2. 프로젝트 구조

```
prompt-lab/
├── .claude/
│   └── agents/
│       ├── planner.md
│       ├── frontend.md
│       ├── backend.md
│       ├── database.md
│       ├── content.md
│       └── i18n.md
├── docs/
│   ├── requirements.md
│   ├── PRD.md
│   ├── TECH_SPEC.md
│   ├── DATABASE.md
│   ├── API_SPEC.md
│   └── CONTENT_STRUCTURE.md
├── prompts/
│   ├── init-project.md
│   ├── setup-supabase.md
│   ├── create-components.md
│   ├── create-api.md
│   └── create-lessons.md
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 로그인 페이지 (/)
│   │   ├── globals.css             # 전역 스타일
│   │   ├── learn/
│   │   │   ├── page.tsx            # 학습 목록 (/learn)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # 학습 상세 (/learn/[slug])
│   │   ├── playground/
│   │   │   └── page.tsx            # 자유 실습 (/playground)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts        # 인증 API
│   │       ├── progress/
│   │       │   └── route.ts        # 진도 API
│   │       └── chat/
│   │           └── route.ts        # OpenAI API 호출
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # 공통 헤더
│   │   │   ├── LanguageToggle.tsx  # 언어 전환
│   │   │   └── Button.tsx          # 공통 버튼
│   │   ├── auth/
│   │   │   └── IdInput.tsx         # 학번/사번 입력
│   │   ├── learn/
│   │   │   ├── LessonCard.tsx      # 학습 카드
│   │   │   ├── LessonContent.tsx   # 학습 콘텐츠
│   │   │   └── ProgressBar.tsx     # 진도 표시
│   │   └── playground/
│   │       ├── PromptEditor.tsx    # 프롬프트 입력
│   │       └── ResponseViewer.tsx  # AI 응답 표시
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # 브라우저 클라이언트
│   │   │   └── server.ts           # 서버 클라이언트
│   │   ├── openai.ts               # OpenAI 클라이언트
│   │   └── utils.ts                # 유틸리티 함수
│   ├── hooks/
│   │   ├── useAuth.ts              # 인증 훅
│   │   ├── useProgress.ts          # 진도 관리 훅
│   │   └── useChat.ts              # AI 채팅 훅
│   ├── types/
│   │   ├── database.ts             # DB 타입 정의
│   │   ├── lesson.ts               # 학습 콘텐츠 타입
│   │   └── api.ts                  # API 요청/응답 타입
│   ├── constants/
│   │   └── lessons.ts              # 학습 단원 상수
│   └── messages/
│       ├── ko.json                 # 한국어 메시지
│       └── en.json                 # 영어 메시지
├── public/
│   └── images/
├── .env.local                      # 환경변수 (로컬)
├── .env.example                    # 환경변수 예시
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. 주요 컴포넌트 설계

### 3.1 페이지 컴포넌트

#### 로그인 페이지 (`/`)
```typescript
// src/app/page.tsx
interface LoginPageProps {}

// 상태
- studentId: string (입력값)
- isLoading: boolean
- error: string | null
- language: 'ko' | 'en'

// 동작
1. 학번/사번 입력 (9자리 숫자)
2. 유효성 검증
3. API 호출 (POST /api/auth)
4. 성공 시 /learn으로 리다이렉트
5. 실패 시 에러 메시지 표시
```

#### 학습 목록 페이지 (`/learn`)
```typescript
// src/app/learn/page.tsx
interface LearnPageProps {}

// 데이터
- lessons: Lesson[] (정적 데이터)
- progress: Progress[] (서버에서 조회)
- user: User

// 동작
1. 사용자 인증 확인
2. 진도 데이터 조회
3. 학습 카드 목록 렌더링
4. 완료 상태 표시
```

#### 학습 상세 페이지 (`/learn/[slug]`)
```typescript
// src/app/learn/[slug]/page.tsx
interface LessonPageProps {
  params: { slug: string }
}

// 데이터
- lesson: Lesson (콘텐츠, 예제)
- isCompleted: boolean

// 레이아웃
- Desktop: 좌측 콘텐츠 | 우측 실습
- Mobile: 탭 전환 (콘텐츠/실습)

// 동작
1. slug로 학습 콘텐츠 조회
2. 마크다운 렌더링
3. 실습 영역에서 프롬프트 실행
4. 완료 체크 시 진도 저장
```

#### Playground 페이지 (`/playground`)
```typescript
// src/app/playground/page.tsx
interface PlaygroundPageProps {}

// 상태
- prompt: string
- response: string
- isLoading: boolean

// 동작
1. 프롬프트 입력
2. 실행 버튼 클릭
3. 스트리밍 응답 표시
4. 복사/초기화 기능
```

### 3.2 공통 컴포넌트

#### Header
```typescript
interface HeaderProps {
  showBackButton?: boolean
  showPlaygroundLink?: boolean
}

// 구성요소
- 로고/타이틀
- 언어 전환 토글
- Playground 바로가기
- 사용자 ID 표시
```

#### LanguageToggle
```typescript
interface LanguageToggleProps {
  currentLanguage: 'ko' | 'en'
  onChange: (lang: 'ko' | 'en') => void
}

// 동작
- 클릭 시 언어 전환
- localStorage + DB 저장
```

#### PromptEditor
```typescript
interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  maxLength?: number
  placeholder?: string
}

// 구성요소
- textarea (자동 높이 조절)
- 글자 수 표시
- 실행 버튼
```

#### ResponseViewer
```typescript
interface ResponseViewerProps {
  content: string
  isStreaming: boolean
}

// 구성요소
- 마크다운 렌더링 영역
- 복사 버튼
- 로딩 인디케이터
```

---

## 4. 상태 관리

### 4.1 클라이언트 상태
```typescript
// localStorage 사용
- userId: string (UUID)
- studentId: string (학번/사번)
- language: 'ko' | 'en'
```

### 4.2 서버 상태
```typescript
// Supabase에서 조회
- User 정보
- Progress (학습 진도)
```

### 4.3 인증 흐름
```
1. 페이지 로드 시 localStorage에서 userId 확인
2. 없으면 로그인 페이지로 리다이렉트
3. 있으면 Supabase에서 사용자 검증
4. 유효하지 않으면 localStorage 클리어 후 로그인으로
```

---

## 5. API 설계 개요

### 5.1 엔드포인트 목록
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth` | 로그인/가입 |
| GET | `/api/progress` | 진도 조회 |
| POST | `/api/progress` | 진도 저장 |
| POST | `/api/chat` | AI 응답 생성 |

### 5.2 인증 방식
- 세션/토큰 없이 `userId`를 헤더 또는 바디로 전달
- 서버에서 Supabase로 사용자 존재 여부 확인
- RLS로 본인 데이터만 접근 가능

---

## 6. 다국어 (i18n) 설계

### 6.1 구조
```
src/messages/
├── ko.json    # 한국어
└── en.json    # 영어
```

### 6.2 메시지 키 구조
```json
{
  "common": {
    "appName": "Prompt Lab",
    "getStarted": "시작하기",
    "loading": "로딩 중..."
  },
  "login": {
    "title": "학번 또는 사번을 입력하세요",
    "placeholder": "9자리 숫자 입력",
    "error": "학번 또는 사번은 9자리 숫자입니다"
  },
  "learn": {
    "progress": "{completed}/{total} 완료",
    "markComplete": "완료로 표시"
  },
  "playground": {
    "placeholder": "프롬프트를 입력하세요...",
    "submit": "실행",
    "copy": "복사",
    "clear": "초기화"
  }
}
```

### 6.3 학습 콘텐츠 다국어
```
data/
├── lessons/
│   ├── ko/
│   │   ├── intro.md
│   │   ├── zero-shot.md
│   │   ├── few-shot.md
│   │   └── chain-of-thought.md
│   └── en/
│       ├── intro.md
│       ├── zero-shot.md
│       ├── few-shot.md
│       └── chain-of-thought.md
```

---

## 7. 환경 변수

### 7.1 .env.example
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 환경별 설정
| 환경 | NEXT_PUBLIC_APP_URL |
|------|---------------------|
| Local | http://localhost:3000 |
| Preview | Vercel 자동 생성 |
| Production | https://prompt-lab.vercel.app |

---

## 8. 보안 고려사항

### 8.1 API 키 보호
- OpenAI API 키는 서버 사이드에서만 사용
- `OPENAI_API_KEY`는 `NEXT_PUBLIC_` 접두사 없이 설정
- API Route에서만 호출

### 8.2 데이터 접근 제어
- Supabase RLS 활성화
- 사용자는 본인의 progress만 조회/수정 가능
- users 테이블은 본인 정보만 조회 가능

### 8.3 입력 검증
- 학번/사번: 9자리 숫자만 허용
- 프롬프트: 최대 4,000자 제한
- API 요청: rate limiting 고려 (향후)

---

## 9. 성능 최적화

### 9.1 Next.js 최적화
- App Router의 서버 컴포넌트 활용
- 정적 콘텐츠는 빌드 타임에 생성
- 동적 라우트는 필요 시에만 SSR

### 9.2 번들 최적화
- 코드 스플리팅 자동 적용
- 이미지 최적화 (next/image)
- 폰트 최적화 (next/font)

### 9.3 API 최적화
- OpenAI 스트리밍 응답 사용
- Supabase 연결 풀링 활용

---

## 10. 배포 설정

### 10.1 Vercel 설정
```json
// vercel.json (필요 시)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### 10.2 환경변수 설정 (Vercel Dashboard)
1. Project Settings → Environment Variables
2. 각 환경(Production, Preview, Development)별 설정
3. Supabase, OpenAI 키 등록

### 10.3 도메인 설정
- 기본: `prompt-lab.vercel.app`
- 커스텀 도메인: 필요 시 추가

---

## 11. 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0.1 | 2025-11-25 | 초안 작성 |
