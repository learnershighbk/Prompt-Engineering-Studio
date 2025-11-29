# 프로젝트 초기화 프롬프트

## 목적
Next.js 14 프로젝트를 초기화하고 기본 설정을 완료합니다.

---

## 프롬프트

```
당신은 Next.js 전문 개발자입니다. Prompt Lab이라는 Prompt Engineering 학습 플랫폼의 프로젝트를 초기화해주세요.

## 프로젝트 요구사항

### 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- OpenAI API
- next-intl (다국어)

### 초기화 단계

1. **프로젝트 생성**
   ```bash
   npx create-next-app@latest prompt-lab --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. **필수 패키지 설치**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr openai next-intl
   npm install -D @types/node
   ```

3. **폴더 구조 생성**
   다음 폴더를 생성해주세요:
   ```
   src/
   ├── app/
   │   ├── api/
   │   │   ├── auth/
   │   │   ├── progress/
   │   │   ├── user/
   │   │   │   └── language/
   │   │   └── chat/
   │   ├── learn/
   │   │   └── [slug]/
   │   └── playground/
   ├── components/
   │   ├── common/
   │   ├── auth/
   │   ├── learn/
   │   └── playground/
   ├── lib/
   │   └── supabase/
   ├── hooks/
   ├── types/
   ├── constants/
   └── messages/
   data/
   └── lessons/
       ├── ko/
       └── en/
   ```

4. **환경 변수 파일 생성**
   `.env.example` 파일을 생성하고 다음 내용을 추가:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   # OpenAI
   OPENAI_API_KEY=

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **TypeScript 설정 확인**
   `tsconfig.json`에 다음 경로 별칭이 있는지 확인:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

6. **Tailwind 설정**
   `tailwind.config.ts` 확인 및 content 경로 설정

7. **기본 레이아웃 생성**
   `src/app/layout.tsx` 파일에 기본 HTML 구조와 폰트 설정

8. **gitignore 확인**
   `.env.local`이 포함되어 있는지 확인

## 출력
각 단계의 실행 결과와 생성된 파일 목록을 보여주세요.
```

---

## 예상 결과물

### 생성되는 파일 목록
```
prompt-lab/
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/ (빈 폴더들)
│   ├── components/ (빈 폴더들)
│   ├── lib/ (빈 폴더들)
│   ├── hooks/ (빈 폴더)
│   ├── types/ (빈 폴더)
│   ├── constants/ (빈 폴더)
│   └── messages/ (빈 폴더)
└── data/
    └── lessons/
        ├── ko/ (빈 폴더)
        └── en/ (빈 폴더)
```

---

## 주의사항

1. Node.js 18+ 버전 필요
2. 패키지 매니저는 npm 사용
3. App Router 사용 (pages 디렉토리 아님)
4. src 디렉토리 사용

---

## 다음 단계
- `setup-supabase.md`: Supabase 설정
- `create-components.md`: UI 컴포넌트 생성
