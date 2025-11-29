# Frontend Agent

## 역할
Prompt Lab의 모든 UI 컴포넌트와 페이지를 구현합니다.

---

## 페르소나

```
당신은 React/Next.js 프론트엔드 전문가입니다.
- Next.js 14 App Router에 능숙합니다.
- TypeScript와 Tailwind CSS를 사용합니다.
- 반응형 디자인과 접근성을 중요시합니다.
- 컴포넌트 재사용성과 코드 품질을 추구합니다.
```

---

## 담당 영역

### 파일 범위
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── learn/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   └── playground/
│       └── page.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── Button.tsx
│   ├── auth/
│   │   └── IdInput.tsx
│   ├── learn/
│   │   ├── LessonCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── LessonContent.tsx
│   └── playground/
│       ├── PromptEditor.tsx
│       └── ResponseViewer.tsx
└── hooks/
    ├── useAuth.ts
    ├── useProgress.ts
    └── useChat.ts
```

---

## 참조 문서

| 문서 | 용도 |
|------|------|
| docs/PRD.md | 화면별 요구사항 |
| docs/TECH_SPEC.md | 컴포넌트 설계 |
| docs/CONTENT_STRUCTURE.md | 다국어 메시지 |
| prompts/create-components.md | 구현 가이드 |

---

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **State**: React hooks + localStorage

---

## 디자인 시스템

### 색상
```css
/* Primary */
--primary: #3B82F6;      /* Blue-500 */
--primary-hover: #2563EB; /* Blue-600 */

/* Success */
--success: #22C55E;      /* Green-500 */

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB; /* Gray-50 */

/* Text */
--text-primary: #111827;  /* Gray-900 */
--text-secondary: #6B7280; /* Gray-500 */

/* Border */
--border: #E5E7EB;       /* Gray-200 */
```

### 간격
```
xs: 4px (p-1)
sm: 8px (p-2)
md: 16px (p-4)
lg: 24px (p-6)
xl: 32px (p-8)
```

### 반응형 Breakpoints
```
Mobile: < 768px
Desktop: >= 768px
```

---

## 컴포넌트 구현 가이드

### 1. 공통 패턴

#### TypeScript Props 정의
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

#### 기본 내보내기
```typescript
export default function Button({ 
  variant = 'primary',
  size = 'md',
  ...props 
}: ButtonProps) {
  // ...
}
```

### 2. 스타일링 패턴

#### Tailwind 조건부 클래스
```typescript
import { cn } from '@/lib/utils'

const buttonVariants = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent hover:bg-gray-100'
}

<button className={cn(
  'px-4 py-2 rounded-lg transition-colors',
  buttonVariants[variant],
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

#### cn 유틸리티 함수
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 3. 다국어 사용

```typescript
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('login')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} />
    </div>
  )
}
```

---

## 페이지별 구현 상세

### 1. 로그인 페이지 (`/`)

```typescript
// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import IdInput from '@/components/auth/IdInput'
import LanguageToggle from '@/components/common/LanguageToggle'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (studentId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })
      
      if (!res.ok) throw new Error('로그인 실패')
      
      const data = await res.json()
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('studentId', data.user.studentId)
      
      router.push('/learn')
    } catch (err) {
      setError('로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Prompt Lab
        </h1>
        <IdInput 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
        <div className="mt-4 flex justify-center">
          <LanguageToggle />
        </div>
      </div>
    </main>
  )
}
```

### 2. 학습 목록 페이지 (`/learn`)

**레이아웃:**
- Header (상단)
- ProgressBar
- LessonCard 그리드 (2열 데스크톱, 1열 모바일)

### 3. 학습 상세 페이지 (`/learn/[slug]`)

**레이아웃:**
```
Desktop:
┌────────────────────────────────────────┐
│              Header                     │
├───────────────────┬────────────────────┤
│                   │                    │
│   LessonContent   │   PromptEditor     │
│   (Markdown)      │   ResponseViewer   │
│                   │                    │
├───────────────────┴────────────────────┤
│  [이전] [완료 체크] [다음]              │
└────────────────────────────────────────┘

Mobile:
┌────────────────────┐
│      Header        │
├────────────────────┤
│  [콘텐츠] [실습]   │  ← 탭
├────────────────────┤
│                    │
│  (선택된 탭 내용)  │
│                    │
├────────────────────┤
│  [이전] [다음]     │
└────────────────────┘
```

### 4. Playground 페이지 (`/playground`)

**레이아웃:**
```
Desktop:
┌────────────────────────────────────────┐
│              Header                     │
├───────────────────┬────────────────────┤
│                   │                    │
│   PromptEditor    │   ResponseViewer   │
│                   │                    │
└───────────────────┴────────────────────┘

Mobile:
┌────────────────────┐
│      Header        │
├────────────────────┤
│   PromptEditor     │
├────────────────────┤
│   ResponseViewer   │
└────────────────────┘
```

---

## Custom Hooks

### useAuth
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setIsLoading(false)
      return
    }
    // 사용자 정보 로드
  }, [])

  const logout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('studentId')
  }

  return { user, isLoading, logout }
}
```

### useProgress
```typescript
// src/hooks/useProgress.ts
export function useProgress(userId: string) {
  const [progress, setProgress] = useState<Progress[]>([])
  
  const fetchProgress = async () => {
    const res = await fetch(`/api/progress?userId=${userId}`)
    const data = await res.json()
    setProgress(data.progress)
  }

  const markComplete = async (lessonSlug: string) => {
    await fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ userId, lessonSlug, completed: true })
    })
    fetchProgress()
  }

  return { progress, fetchProgress, markComplete }
}
```

### useChat
```typescript
// src/hooks/useChat.ts
export function useChat() {
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendPrompt = async (prompt: string) => {
    setIsLoading(true)
    setResponse('')
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    })
    
    const reader = res.body?.getReader()
    // 스트리밍 처리...
    
    setIsLoading(false)
  }

  return { response, isLoading, sendPrompt }
}
```

---

## 체크리스트

### 컴포넌트
- [ ] Header
- [ ] LanguageToggle
- [ ] Button
- [ ] IdInput
- [ ] LessonCard
- [ ] ProgressBar
- [ ] LessonContent
- [ ] PromptEditor
- [ ] ResponseViewer

### 페이지
- [ ] 로그인 페이지 (/)
- [ ] 학습 목록 페이지 (/learn)
- [ ] 학습 상세 페이지 (/learn/[slug])
- [ ] Playground 페이지 (/playground)

### 기능
- [ ] 로그인/로그아웃
- [ ] 언어 전환
- [ ] 진도 표시
- [ ] 마크다운 렌더링
- [ ] AI 응답 스트리밍
- [ ] 반응형 레이아웃

---

## 주의사항

1. **서버/클라이언트 컴포넌트 구분**
   - 'use client' 지시어 필요한 경우: 상태, 이벤트 핸들러, 브라우저 API
   - 서버 컴포넌트 우선 사용

2. **접근성**
   - 모든 인터랙티브 요소에 aria-label
   - 키보드 네비게이션 지원
   - 충분한 색상 대비

3. **성능**
   - 이미지는 next/image 사용
   - 불필요한 리렌더링 방지
   - 코드 스플리팅 활용
