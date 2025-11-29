# UI 컴포넌트 생성 프롬프트

## 목적
Prompt Lab의 모든 UI 컴포넌트와 페이지를 생성합니다.

---

## 프롬프트

```
당신은 React/Next.js 프론트엔드 전문가입니다. Prompt Lab 프로젝트의 UI 컴포넌트와 페이지를 생성해주세요.

## 참조 문서
- PRD.md: 화면별 상세 요구사항
- TECH_SPEC.md: 컴포넌트 설계
- CONTENT_STRUCTURE.md: 다국어 메시지

## 기술 스택
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- next-intl (다국어)

## 디자인 가이드
- Primary Color: Blue (#3B82F6)
- Success Color: Green (#22C55E)
- Background: White / Gray-50
- Text: Gray-900
- 반응형: Mobile < 768px / Desktop ≥ 768px

---

## 파트 1: 공통 컴포넌트

### 1.1 Header (src/components/common/Header.tsx)
Props:
- showBackButton?: boolean
- showPlaygroundLink?: boolean

기능:
- 로고 "Prompt Lab"
- 언어 전환 토글 (KOR/ENG)
- Playground 바로가기 링크 (조건부)
- 사용자 학번/사번 표시

### 1.2 LanguageToggle (src/components/common/LanguageToggle.tsx)
Props:
- currentLanguage: 'ko' | 'en'
- onChange: (lang: 'ko' | 'en') => void

기능:
- 버튼 클릭으로 언어 전환
- 현재 언어 하이라이트

### 1.3 Button (src/components/common/Button.tsx)
Props:
- variant: 'primary' | 'secondary' | 'ghost'
- size: 'sm' | 'md' | 'lg'
- isLoading?: boolean
- disabled?: boolean
- children: React.ReactNode
- onClick?: () => void

---

## 파트 2: 인증 컴포넌트

### 2.1 IdInput (src/components/auth/IdInput.tsx)
Props:
- onSubmit: (studentId: string) => void
- isLoading: boolean
- error?: string

기능:
- 9자리 숫자만 입력 가능
- 실시간 유효성 검증
- 에러 메시지 표시
- 다국어 지원

---

## 파트 3: 학습 컴포넌트

### 3.1 LessonCard (src/components/learn/LessonCard.tsx)
Props:
- slug: string
- title: string
- description: string
- duration: string
- isCompleted: boolean
- order: number

기능:
- 카드 형태 UI
- 완료 뱃지 (체크 아이콘)
- 클릭 시 해당 단원으로 이동
- hover 효과

### 3.2 ProgressBar (src/components/learn/ProgressBar.tsx)
Props:
- completed: number
- total: number

기능:
- 진행률 바 표시
- "2/4 완료" 텍스트

### 3.3 LessonContent (src/components/learn/LessonContent.tsx)
Props:
- content: string (Markdown)
- examples: Example[]

기능:
- Markdown 렌더링
- 예제 코드 블록에 복사 버튼
- 예제 섹션 표시

---

## 파트 4: Playground 컴포넌트

### 4.1 PromptEditor (src/components/playground/PromptEditor.tsx)
Props:
- value: string
- onChange: (value: string) => void
- onSubmit: () => void
- isLoading: boolean
- maxLength?: number (default: 4000)
- placeholder?: string

기능:
- textarea 자동 높이 조절
- 글자 수 카운터 (예: 150/4000)
- 실행 버튼
- 초기화 버튼
- 단축키: Ctrl/Cmd + Enter로 실행

### 4.2 ResponseViewer (src/components/playground/ResponseViewer.tsx)
Props:
- content: string
- isStreaming: boolean

기능:
- Markdown 렌더링
- 스트리밍 중 커서 깜빡임 효과
- 복사 버튼
- 빈 상태 UI

---

## 파트 5: 페이지

### 5.1 로그인 페이지 (src/app/page.tsx)
- 중앙 정렬 레이아웃
- 로고 + 타이틀
- IdInput 컴포넌트
- 언어 선택

### 5.2 학습 목록 페이지 (src/app/learn/page.tsx)
- Header 포함
- ProgressBar
- LessonCard 목록 (4개)
- 반응형 그리드 (모바일 1열, 데스크톱 2열)

### 5.3 학습 상세 페이지 (src/app/learn/[slug]/page.tsx)
- Header (뒤로가기 버튼)
- 데스크톱: 좌측 콘텐츠 | 우측 실습 (50:50)
- 모바일: 탭 전환 (콘텐츠/실습)
- 하단: 이전/다음 버튼, 완료 체크박스

### 5.4 Playground 페이지 (src/app/playground/page.tsx)
- Header
- 데스크톱: 좌측 입력 | 우측 출력 (50:50)
- 모바일: 상단 입력, 하단 출력 (스크롤)

---

## 출력 형식

각 컴포넌트/페이지에 대해:
1. 파일 경로
2. 전체 TypeScript/TSX 코드
3. 사용된 Tailwind 클래스 설명 (필요시)

모든 컴포넌트는 다음을 포함해야 합니다:
- TypeScript 타입 정의
- 다국어 메시지 사용 (하드코딩 금지)
- 반응형 디자인
- 접근성 고려 (aria-label 등)
```

---

## 예상 결과물

### 파일 목록
```
src/components/
├── common/
│   ├── Header.tsx
│   ├── LanguageToggle.tsx
│   └── Button.tsx
├── auth/
│   └── IdInput.tsx
├── learn/
│   ├── LessonCard.tsx
│   ├── ProgressBar.tsx
│   └── LessonContent.tsx
└── playground/
    ├── PromptEditor.tsx
    └── ResponseViewer.tsx

src/app/
├── page.tsx              (로그인)
├── layout.tsx            (루트 레이아웃)
├── learn/
│   ├── page.tsx          (학습 목록)
│   └── [slug]/
│       └── page.tsx      (학습 상세)
└── playground/
    └── page.tsx          (Playground)
```

---

## 컴포넌트 의존성

```
page.tsx (로그인)
└── IdInput
    └── Button

learn/page.tsx
├── Header
│   └── LanguageToggle
├── ProgressBar
└── LessonCard

learn/[slug]/page.tsx
├── Header
├── LessonContent
├── PromptEditor
├── ResponseViewer
└── Button

playground/page.tsx
├── Header
├── PromptEditor
└── ResponseViewer
```

---

## 다음 단계
- `create-api.md`: API 라우트 생성
- `create-lessons.md`: 학습 콘텐츠 생성
