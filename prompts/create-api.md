# API 라우트 생성 프롬프트

## 목적
Prompt Lab의 모든 API 엔드포인트를 생성합니다.

---

## 프롬프트

```
당신은 Next.js API Routes 전문가입니다. Prompt Lab 프로젝트의 API 엔드포인트를 생성해주세요.

## 참조 문서
- API_SPEC.md: API 엔드포인트 상세 명세
- DATABASE.md: DB 스키마 및 쿼리

## 기술 스택
- Next.js 14 App Router (Route Handlers)
- TypeScript
- Supabase (PostgreSQL)
- OpenAI API

## API 목록
1. POST /api/auth - 로그인/회원가입
2. GET /api/progress - 진도 조회
3. POST /api/progress - 진도 저장
4. PATCH /api/user/language - 언어 설정 변경
5. POST /api/chat - AI 응답 생성 (스트리밍)

---

## API 1: 인증 (POST /api/auth)

### 파일 경로
src/app/api/auth/route.ts

### 요구사항
- 입력: { studentId: string }
- studentId 검증: 9자리 숫자
- 기존 사용자면 조회, 없으면 생성
- 응답: { user: User, isNewUser: boolean }

### 에러 처리
- INVALID_STUDENT_ID (400): 형식 오류
- DB_ERROR (500): 데이터베이스 오류

---

## API 2: 진도 조회 (GET /api/progress)

### 파일 경로
src/app/api/progress/route.ts

### 요구사항
- 쿼리 파라미터: userId
- 전체 4개 단원의 진도 반환
- 완료되지 않은 단원도 포함 (completed: false)

### 응답 형식
```typescript
{
  progress: [
    { lessonSlug: 'intro', completed: true, completedAt: '...' },
    { lessonSlug: 'zero-shot', completed: false, completedAt: null },
    // ...
  ],
  summary: { total: 4, completed: 2 }
}
```

---

## API 3: 진도 저장 (POST /api/progress)

### 파일 경로
src/app/api/progress/route.ts (같은 파일, POST 핸들러)

### 요구사항
- 입력: { userId, lessonSlug, completed }
- lessonSlug 검증: 유효한 단원인지 확인
- Upsert 로직 (있으면 업데이트, 없으면 생성)
- completed가 true면 completedAt에 현재 시간 저장

### 유효한 lessonSlug
- 'intro'
- 'zero-shot'
- 'few-shot'
- 'chain-of-thought'

---

## API 4: 언어 설정 (PATCH /api/user/language)

### 파일 경로
src/app/api/user/language/route.ts

### 요구사항
- 입력: { userId, language }
- language 검증: 'ko' | 'en'
- users 테이블 업데이트

---

## API 5: AI 채팅 (POST /api/chat)

### 파일 경로
src/app/api/chat/route.ts

### 요구사항
- 입력: { userId, prompt }
- prompt 검증: 최대 4,000자
- OpenAI API 호출 (gpt-4o-mini)
- Server-Sent Events (SSE) 스트리밍 응답

### 스트리밍 구현
```typescript
// ReadableStream을 사용한 SSE 응답
const encoder = new TextEncoder()
const stream = new ReadableStream({
  async start(controller) {
    // OpenAI 스트림 처리
    for await (const chunk of openaiStream) {
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

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
})
```

### OpenAI 설정
- Model: gpt-4o-mini
- System prompt: "You are a helpful assistant for learning prompt engineering. Respond in the same language as the user's input."
- stream: true

---

## 추가 파일: OpenAI 클라이언트

### 파일 경로
src/lib/openai.ts

### 요구사항
```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

---

## 추가 파일: API 타입 정의

### 파일 경로
src/types/api.ts

### 요구사항
모든 API 요청/응답 타입 정의:
- AuthRequest, AuthResponse
- ProgressResponse, SaveProgressRequest
- UpdateLanguageRequest
- ChatRequest
- ErrorResponse

---

## 출력 형식

각 API에 대해:
1. 파일 경로
2. 전체 TypeScript 코드
3. 테스트용 curl 명령어

## 에러 처리 패턴

모든 API는 다음 패턴을 따릅니다:
```typescript
try {
  // 1. 입력 검증
  // 2. 비즈니스 로직
  // 3. 성공 응답
} catch (error) {
  console.error('API Error:', error)
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
    { status: 500 }
  )
}
```
```

---

## 예상 결과물

### 파일 목록
```
src/app/api/
├── auth/
│   └── route.ts
├── progress/
│   └── route.ts
├── user/
│   └── language/
│       └── route.ts
└── chat/
    └── route.ts

src/lib/
├── openai.ts
└── supabase/
    ├── client.ts
    └── server.ts

src/types/
├── database.ts
└── api.ts
```

---

## 테스트 curl 명령어

### 인증
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"studentId": "202412345"}'
```

### 진도 조회
```bash
curl "http://localhost:3000/api/progress?userId=USER_UUID"
```

### 진도 저장
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_UUID", "lessonSlug": "intro", "completed": true}'
```

### 언어 변경
```bash
curl -X PATCH http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_UUID", "language": "en"}'
```

### AI 채팅
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_UUID", "prompt": "안녕하세요"}' \
  --no-buffer
```

---

## 다음 단계
- `create-lessons.md`: 학습 콘텐츠 생성
