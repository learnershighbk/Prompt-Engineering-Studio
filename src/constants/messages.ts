"use client";

export type Language = "ko" | "en";

export const messages = {
  ko: {
    common: {
      appName: "Prompt Lab",
      playground: "Playground",
      back: "뒤로",
      next: "다음",
      previous: "이전",
      complete: "완료",
      copy: "복사",
      copied: "복사됨!",
      reset: "초기화",
      execute: "실행",
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
    },
    login: {
      title: "Prompt Lab",
      subtitle: "학번 또는 사번을 입력하세요",
      placeholder: "9자리 숫자 입력",
      button: "시작하기",
      error: "학번 또는 사번은 9자리 숫자입니다",
      loginFailed: "로그인에 실패했습니다",
    },
    learn: {
      title: "학습 목록",
      progressText: "{completed}/{total} 완료",
      duration: "{time} 소요",
      completed: "완료",
      markComplete: "완료로 표시",
      content: "콘텐츠",
      practice: "실습",
    },
    playground: {
      title: "Playground",
      inputPlaceholder: "프롬프트를 입력하세요...",
      executeButton: "프롬프트 실행",
      charCount: "{current}/{max}",
      emptyResponse: "프롬프트를 실행하면 AI 응답이 여기에 표시됩니다.",
      streaming: "응답 생성 중...",
    },
    language: {
      ko: "한국어",
      en: "English",
    },
  },
  en: {
    common: {
      appName: "Prompt Lab",
      playground: "Playground",
      back: "Back",
      next: "Next",
      previous: "Previous",
      complete: "Complete",
      copy: "Copy",
      copied: "Copied!",
      reset: "Reset",
      execute: "Execute",
      loading: "Loading...",
      error: "An error occurred",
    },
    login: {
      title: "Prompt Lab",
      subtitle: "Enter your student or employee ID",
      placeholder: "Enter 9-digit number",
      button: "Get Started",
      error: "ID must be exactly 9 digits",
      loginFailed: "Login failed",
    },
    learn: {
      title: "Learning Path",
      progressText: "{completed}/{total} completed",
      duration: "{time}",
      completed: "Completed",
      markComplete: "Mark as complete",
      content: "Content",
      practice: "Practice",
    },
    playground: {
      title: "Playground",
      inputPlaceholder: "Enter your prompt...",
      executeButton: "Execute Prompt",
      charCount: "{current}/{max}",
      emptyResponse: "AI response will appear here after you execute a prompt.",
      streaming: "Generating response...",
    },
    language: {
      ko: "한국어",
      en: "English",
    },
  },
} as const;

export type Messages = typeof messages.ko;

export function getMessage(
  lang: Language,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split(".");
  let value: unknown = messages[lang];

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  if (typeof value !== "string") {
    return path;
  }

  if (params) {
    return Object.entries(params).reduce(
      (acc, [key, val]) => acc.replace(`{${key}}`, String(val)),
      value
    );
  }

  return value;
}

