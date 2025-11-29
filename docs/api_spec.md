# API Specification

## 프로젝트명
Prompt Lab - Prompt Engineering 학습 플랫폼

---

## 1. 개요

### 1.1 기본 정보
| 항목 | 값 |
|------|-----|
| Base URL (로컬) | `http://localhost:3000/api` |
| Base URL (프로덕션) | `https://prompt-lab.vercel.app/api` |
| 프로토콜 | HTTPS |
| 응답 형식 | JSON |

### 1.2 엔드포인트 목록
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth` | 로그인/회원가입 |
| GET | `/api/progress` | 학습 진도 조회 |
| POST | `/api/progress` | 학습 진도 저장 |
| PATCH | `/api/user/language` | 언어 설정 변경 |
| POST | `/api/chat` | AI 응답 생성 (스트리밍) |

---

## 2. 공통 사항

### 2.1 요청 헤더
```
Content-Type: application/json
```

### 2.2 인증
MVP에서는 별도 토큰 없이 `userId`를 요청 바디 또는 쿼리 파라미터로 전달합니다.

```typescript
// 요청 예시
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2.3 공통 에러 응답
```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}
```

### 2.4 HTTP 상태 코드
| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## 3. 인증 API

### 3.1 POST `/api/auth`

학번/사번으로 로그인하거나, 신규 사용자인 경우 자동으로 계정을 생성합니다.

#### Request
```typescript
interface AuthRequest {
  studentId: string  // 9자리 숫자
}
```

#### Request 예시
```json
{
  "studentId": "202412345"
}
```

#### Response (성공 - 기존 사용자)
```typescript
interface AuthResponse {
  user: {
    id: string
    studentId: string
    userType: 'student' | 'staff'
    language: 'ko' | 'en'
    createdAt: string
  }
  isNewUser: boolean
}
```

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "studentId": "202412345",
    "userType": "student",
    "language": "ko",
    "createdAt": "2025-11-25T10:00:00.000Z"
  },
  "isNewUser": false
}
```

#### Response (성공 - 신규 사용자)
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "studentId": "202412345",
    "userType": "student",
    "language": "ko",
    "createdAt": "2025-11-25T12:00:00.000Z"
  },
  "isNewUser": true
}
```

#### Response (에러 - 잘못된 형식)
```json
{
  "error": {
    "code": "INVALID_STUDENT_ID",
    "message": "학번 또는 사번은 9자리 숫자입니다"
  }
}
```

#### 구현 로직
```typescript
// src/app/api/auth/route.ts
export async function POST(request: Request) {
  const { studentId } = await request.json()
  
  // 1. 검증: 9자리 숫자
  if (!/^\d{9}$/.test(studentId)) {
    return Response.json(
      { error: { code: 'INVALID_STUDENT_ID', message: '학번 또는 사번은 9자리 숫자입니다' } },
      { status: 400 }
    )
  }
  
  // 2. 기존 사용자 조회
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('student_id', studentId)
    .single()
  
  if (existingUser) {
    return Response.json({ user: existingUser, isNewUser: false })
  }
  
  // 3. 신규 사용자 생성
  const { data: newUser } = await supabase
    .from('users')
    .insert({ student_id: studentId })
    .select()
    .single()
  
  return Response.json({ user: newUser, isNewUser: true }, { status: 201 })
}
```

---

## 4. 진도 API

### 4.1 GET `/api/progress`

사용자의 학습 진도를 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `userId` | string | O | 사용자 UUID |

#### Request 예시
```
GET /api/progress?userId=550e8400-e29b-41d4-a716-446655440000
```

#### Response (성공)
```typescript
interface ProgressResponse {
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
```

```json
{
  "progress": [
    {
      "lessonSlug": "intro",
      "completed": true,
      "completedAt": "2025-11-25T10:30:00.000Z"
    },
    {
      "lessonSlug": "zero-shot",
      "completed": true,
      "completedAt": "2025-11-25T11:00:00.000Z"
    },
    {
      "lessonSlug": "few-shot",
      "completed": false,
      "completedAt": null
    },
    {
      "lessonSlug": "chain-of-thought",
      "completed": false,
      "completedAt": null
    }
  ],
  "summary": {
    "total": 4,
    "completed": 2
  }
}
```

#### 구현 로직
```typescript
// src/app/api/progress/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return Response.json(
      { error: { code: 'MISSING_USER_ID', message: 'userId가 필요합니다' } },
      { status: 400 }
    )
  }
  
  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_slug, completed, completed_at')
    .eq('user_id', userId)
  
  const lessons = ['intro', 'zero-shot', 'few-shot', 'chain-of-thought']
  const progressMap = new Map(progress?.map(p => [p.lesson_slug, p]) || [])
  
  const fullProgress = lessons.map(slug => ({
    lessonSlug: slug,
    completed: progressMap.get(slug)?.completed || false,
    completedAt: progressMap.get(slug)?.completed_at || null
  }))
  
  return Response.json({
    progress: fullProgress,
    summary: {
      total: lessons.length,
      completed: fullProgress.filter(p => p.completed).length
    }
  })
}
```

---

### 4.2 POST `/api/progress`

학습 완료 상태를 저장합니다.

#### Request
```typescript
interface SaveProgressRequest {
  userId: string
  lessonSlug: string
  completed: boolean
}
```

#### Request 예시
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "lessonSlug": "zero-shot",
  "completed": true
}
```

#### Response (성공)
```json
{
  "success": true,
  "progress": {
    "lessonSlug": "zero-shot",
    "completed": true,
    "completedAt": "2025-11-25T12:00:00.000Z"
  }
}
```

#### Response (에러 - 잘못된 단원)
```json
{
  "error": {
    "code": "INVALID_LESSON",
    "message": "유효하지 않은 학습 단원입니다"
  }
}
```

#### 구현 로직
```typescript
// src/app/api/progress/route.ts
export async function POST(request: Request) {
  const { userId, lessonSlug, completed } = await request.json()
  
  const validSlugs = ['intro', 'zero-shot', 'few-shot', 'chain-of-thought']
  if (!validSlugs.includes(lessonSlug)) {
    return Response.json(
      { error: { code: 'INVALID_LESSON', message: '유효하지 않은 학습 단원입니다' } },
      { status: 400 }
    )
  }
  
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
  
  return Response.json({
    success: true,
    progress: {
      lessonSlug: data.lesson_slug,
      completed: data.completed,
      completedAt: data.completed_at
    }
  })
}
```

---

## 5. 사용자 설정 API

### 5.1 PATCH `/api/user/language`

사용자의 언어 설정을 변경합니다.

#### Request
```typescript
interface UpdateLanguageRequest {
  userId: string
  language: 'ko' | 'en'
}
```

#### Request 예시
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "language": "en"
}
```

#### Response (성공)
```json
{
  "success": true,
  "language": "en"
}
```

#### Response (에러)
```json
{
  "error": {
    "code": "INVALID_LANGUAGE",
    "message": "지원하지 않는 언어입니다"
  }
}
```

#### 구현 로직
```typescript
// src/app/api/user/language/route.ts
export async function PATCH(request: Request) {
  const { userId, language } = await request.json()
  
  if (!['ko', 'en'].includes(language)) {
    return Response.json(
      { error: { code: 'INVALID_LANGUAGE', message: '지원하지 않는 언어입니다' } },
      { status: 400 }
    )
  }
  
  const { error } = await supabase
    .from('users')
    .update({ language })
    .eq('id', userId)
  
  if (error) {
    return Response.json(
      { error: { code: 'UPDATE_FAILED', message: '언어 변경에 실패했습니다' } },
      { status: 500 }
    )
  }
  
  return Response.json({ success: true, language })
}
```

---

## 6. AI 채팅 API

### 6.1 POST `/api/chat`

프롬프트를 OpenAI API로 전송하고 스트리밍 응답을 반환합니다.

#### Request
```typescript
interface ChatRequest {
  userId: string
  prompt: string
}
```

#### Request 예시
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "prompt": "다음 문장의 감정을 분석해주세요: 오늘 정말 기분이 좋아요!"
}
```

#### Response (스트리밍)
Server-Sent Events (SSE) 형식으로 응답합니다.

```
Content-Type: text/event-stream

data: {"content": "이"}
data: {"content": " 문장"}
data: {"content": "은"}
data: {"content": " 긍정"}
data: {"content": "적인"}
data: {"content": " 감정"}
data: {"content": "을"}
data: {"content": " 표현"}
data: {"content": "합니다"}
data: {"content": "."}
data: [DONE]
```

#### Response (에러 - 프롬프트 너무 김)
```json
{
  "error": {
    "code": "PROMPT_TOO_LONG",
    "message": "프롬프트는 4,000자 이내여야 합니다"
  }
}
```

#### Response (에러 - API 오류)
```json
{
  "error": {
    "code": "AI_API_ERROR",
    "message": "AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

#### 구현 로직
```typescript
// src/app/api/chat/route.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  const { userId, prompt } = await request.json()
  
  // 검증: 프롬프트 길이
  if (prompt.length > 4000) {
    return Response.json(
      { error: { code: 'PROMPT_TOO_LONG', message: '프롬프트는 4,000자 이내여야 합니다' } },
      { status: 400 }
    )
  }
  
  try {
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
    
    // 스트리밍 응답 생성
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
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
    return Response.json(
      { error: { code: 'AI_API_ERROR', message: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' } },
      { status: 500 }
    )
  }
}
```

---

## 7. 클라이언트 사용 예시

### 7.1 인증 (로그인)
```typescript
// src/hooks/useAuth.ts
async function login(studentId: string) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  
  const data = await response.json()
  
  // localStorage에 저장
  localStorage.setItem('userId', data.user.id)
  localStorage.setItem('studentId', data.user.studentId)
  localStorage.setItem('language', data.user.language)
  
  return data
}
```

### 7.2 진도 조회
```typescript
// src/hooks/useProgress.ts
async function fetchProgress(userId: string) {
  const response = await fetch(`/api/progress?userId=${userId}`)
  
  if (!response.ok) {
    throw new Error('진도 조회에 실패했습니다')
  }
  
  return response.json()
}
```

### 7.3 AI 채팅 (스트리밍)
```typescript
// src/hooks/useChat.ts
async function sendPrompt(
  userId: string,
  prompt: string,
  onChunk: (content: string) => void
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, prompt })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        
        try {
          const parsed = JSON.parse(data)
          onChunk(parsed.content)
        } catch (e) {
          // 파싱 에러 무시
        }
      }
    }
  }
}
```

---

## 8. 에러 코드 정리

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_STUDENT_ID` | 400 | 학번/사번 형식 오류 (9자리 숫자) |
| `MISSING_USER_ID` | 400 | userId 누락 |
| `INVALID_LESSON` | 400 | 유효하지 않은 학습 단원 |
| `INVALID_LANGUAGE` | 400 | 지원하지 않는 언어 |
| `PROMPT_TOO_LONG` | 400 | 프롬프트 4,000자 초과 |
| `USER_NOT_FOUND` | 404 | 사용자 없음 |
| `UPDATE_FAILED` | 500 | DB 업데이트 실패 |
| `AI_API_ERROR` | 500 | OpenAI API 오류 |

---

## 9. Rate Limiting (향후 고려)

MVP 이후 적용 예정:
- `/api/chat`: 분당 10회 제한
- `/api/auth`: 분당 5회 제한

---

## 10. 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0.1 | 2025-11-25 | 초안 작성 |
