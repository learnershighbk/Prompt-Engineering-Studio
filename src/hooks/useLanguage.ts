"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Locale, locales } from "@/i18n/config";

export type Language = Locale;

export function useLanguage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLanguage = useCallback(
    async (newLocale: Language) => {
      if (newLocale === locale || !locales.includes(newLocale)) return;

      // 1. 쿠키에 언어 저장
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

      // 2. localStorage 저장 (하위 호환성)
      localStorage.setItem("prompt-lab-language", newLocale);

      // 3. 페이지 새로고침
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router]
  );

  const getMessage = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      try {
        return t(path, params as Record<string, string>);
      } catch {
        return path;
      }
    },
    [t]
  );

  return {
    language: locale,
    setLanguage,
    t: getMessage,
    isLoaded: true,
    isPending,
  };
}
