# Backend Agent

## 역할
Prompt Lab의 모든 API 엔드포인트와 서버 로직을 구현합니다.

---

## 페르소나

```
당신은 Next.js API Routes 및 백엔드 전문가입니다.
- Next.js 14 Route Handlers에 능숙합니다.
- TypeScript로 타입 안전한 코드를 작성합니다.
- RESTful API 설계 원칙을 따릅니다.
- 에러 처리와 보안을 중요시합니다.
```

---

## 담당 영역

### 파일 범위
```
src/
├── app/api/
│   ├── auth/
│   │   └── route.ts
│   ├── progress/
│   │   └── route.ts
│   ├── user/
│   │   └── language/
│   │       └── route.ts
│   └── chat/
│       └── route.ts
├── lib/
│   ├── openai.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
└── types/
    ├── database.ts
    └── api.ts
```

---

## 참조 문서

| 문서 | 용도 |
|------|------|
| docs/API_SPEC.md | API 명세 |
| docs/DATABASE.md | DB 스키마 |
| prompts/create-api.md | 구현 가이드 |

---

## 기술 스택

- **Runtime**: Next.js 14 Route Handlers
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API
- **Streaming**: Server-Sent Events (SSE)

---

## API 구현 가이드

### 1. 기본 Route Handler 구조

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 1. 파라미터 추출
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // 2. 검증
    if (!id) {
      return NextResponse.json(
        { error: { code: 'MISSING_ID', message: 'ID가 필요합니다' } },
        { status: 400 }
      )
    }

    // 3. 비즈니스 로직
    const data = await fetchData(id)

    // 4. 성공 응답
    return NextResponse.json(data)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 바디 파싱
    const body = await request.json()
    
    // 2. 검증 & 로직 & 응답
    // ...
  } catch (error) {
    // 에러 처리
  }
}
```

### 2. 타입 정의

```typescript
// src/types/api.ts

// 공통 에러 응답
export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

// 인증 API
export interface AuthRequest {
  studentId: string
}

export interface AuthResponse {
  user: {
    id: string
    studentId: string
    userType: 'student' | 'staff'
    language: 'ko' | 'en'
    createdAt: string
  }
  isNewUser: boolean
}

// 진도 API
export interface ProgressResponse {
  progress: Array<{
    lessonSlug: string
    completed: boolean
    completedAt: string | null
  }>
  summary: {
    total: number
    completed: number
  }
}

export interface SaveProgressRequest {
  userId: string
  lessonSlug: string
  completed: boolean
}

// 언어 설정 API
export interface UpdateLanguageRequest {
  userId: string
  language: 'ko' | 'en'
}

// 채팅 API
export interface ChatRequest {
  userId: string
  prompt: string
}
```

---

## API 엔드포인트 상세

### 1. POST /api/auth

**기능**: 학번/사번으로 로그인 또는 자동 회원가입

```typescript
// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json()

    // 검증: 9자리 숫자
    if (!/^\d{9}$/.test(studentId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_STUDENT_ID', message: '학번 또는 사번은 9자리 숫자입니다' } },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 기존 사용자 조회
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (existingUser) {
      return NextResponse.json({
        user: {
          id: existingUser.id,
          studentId: existingUser.student_id,
          userType: existingUser.user_type,
          language: existingUser.language,
          createdAt: existingUser.created_at
        },
        isNewUser: false
      })
    }

    // 신규 사용자 생성
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ student_id: studentId })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      user: {
        id: newUser.id,
        studentId: newUser.student_id,
        userType: newUser.user_type,
        language: newUser.language,
        createdAt: newUser.created_at
      },
      isNewUser: true
    }, { status: 201 })

  } catch (error) {
    console.error('Auth Error:', error)
    return NextResponse.json(
      { error: { code: 'AUTH_ERROR', message: '인증 처리 중 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
```

### 2. GET/POST /api/progress

```typescript
// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const VALID_LESSONS = ['intro', 'zero-shot', 'few-shot', 'chain-of-thought']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_USER_ID', message: 'userId가 필요합니다' } },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: progress } = await supabase
      .from('progress')
      .select('lesson_slug, completed, completed_at')
      .eq('user_id', userId)

    // 전체 단원에 대한 진도 매핑
    const progressMap = new Map(
      progress?.map(p => [p.lesson_slug, p]) || []
    )

    const fullProgress = VALID_LESSONS.map(slug => ({
      lessonSlug: slug,
      completed: progressMap.get(slug)?.completed || false,
      completedAt: progressMap.get(slug)?.completed_at || null
    }))

    return NextResponse.json({
      progress: fullProgress,
      summary: {
        total: VALID_LESSONS.length,
        completed: fullProgress.filter(p => p.completed).length
      }
    })

  } catch (error) {
    console.error('Progress GET Error:', error)
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: '진도 조회에 실패했습니다' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonSlug, completed } = await request.json()

    // 검증
    if (!VALID_LESSONS.includes(lessonSlug)) {
      return NextResponse.json(
        { error: { code: 'INVALID_LESSON', message: '유효하지 않은 학습 단원입니다' } },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const completedAt = completed ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        lesson_slug: lessonSlug,
        completed,
        completed_at: completedAt
      }, {
        onConflict: 'user_id,lesson_slug'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      progress: {
        lessonSlug: data.lesson_slug,
        completed: data.completed,
        completedAt: data.completed_at
      }
    })

  } catch (error) {
    console.error('Progress POST Error:', error)
    return NextResponse.json(
      { error: { code: 'SAVE_ERROR', message: '진도 저장에 실패했습니다' } },
      { status: 500 }
    )
  }
}
```

### 3. PATCH /api/user/language

```typescript
// src/app/api/user/language/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const { userId, language } = await request.json()

    if (!['ko', 'en'].includes(language)) {
      return NextResponse.json(
        { error: { code: 'INVALID_LANGUAGE', message: '지원하지 않는 언어입니다' } },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('users')
      .update({ language })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true, language })

  } catch (error) {
    console.error('Language Update Error:', error)
    return NextResponse.json(
      { error: { code: 'UPDATE_ERROR', message: '언어 설정 변경에 실패했습니다' } },
      { status: 500 }
    )
  }
}
```

### 4. POST /api/chat (스트리밍)

```typescript
// src/app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'

const MAX_PROMPT_LENGTH = 4000

export async function POST(request: NextRequest) {
  try {
    const { userId, prompt } = await request.json()

    // 검증
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'PROMPT_TOO_LONG', 
            message: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이내여야 합니다` 
          } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // OpenAI 스트리밍 호출
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for learning prompt engineering. Respond in the same language as the user\'s input.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    })

    // SSE 스트림 생성
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Chat Error:', error)
    return new Response(
      JSON.stringify({ 
        error: { 
          code: 'AI_API_ERROR', 
          message: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' 
        } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

---

## 유틸리티 파일

### OpenAI 클라이언트
```typescript
// src/lib/openai.ts
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

### Supabase 서버 클라이언트
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

## 에러 코드 정리

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_STUDENT_ID` | 400 | 학번/사번 형식 오류 |
| `MISSING_USER_ID` | 400 | userId 파라미터 누락 |
| `INVALID_LESSON` | 400 | 유효하지 않은 단원 |
| `INVALID_LANGUAGE` | 400 | 지원하지 않는 언어 |
| `PROMPT_TOO_LONG` | 400 | 프롬프트 길이 초과 |
| `AUTH_ERROR` | 500 | 인증 처리 오류 |
| `FETCH_ERROR` | 500 | 데이터 조회 오류 |
| `SAVE_ERROR` | 500 | 데이터 저장 오류 |
| `UPDATE_ERROR` | 500 | 데이터 업데이트 오류 |
| `AI_API_ERROR` | 500 | OpenAI API 오류 |

---

## 보안 고려사항

1. **API 키 보호**
   - OpenAI API 키는 서버에서만 사용
   - 환경변수로 관리

2. **입력 검증**
   - 모든 입력값 검증
   - SQL Injection 방지 (Supabase 파라미터 바인딩)

3. **에러 메시지**
   - 사용자에게는 일반적인 메시지
   - 상세 에러는 서버 로그에만

4. **Rate Limiting** (향후)
   - /api/chat: 분당 10회
   - /api/auth: 분당 5회

---

## 체크리스트

- [ ] POST /api/auth
- [ ] GET /api/progress
- [ ] POST /api/progress
- [ ] PATCH /api/user/language
- [ ] POST /api/chat (스트리밍)
- [ ] OpenAI 클라이언트 설정
- [ ] Supabase 클라이언트 설정
- [ ] 타입 정의 완료
- [ ] 에러 처리 구현
- [ ] 로깅 추가
