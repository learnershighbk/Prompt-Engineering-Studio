"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { Locale, locales } from "@/i18n/config";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    // 1. 쿠키에 언어 저장
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    // 2. localStorage 저장 (하위 호환성)
    localStorage.setItem("prompt-lab-language", newLocale);

    // 3. DB 저장 (로그인된 경우)
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        await fetch("/api/user/language", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, language: newLocale }),
        });
      } catch {
        // 에러 무시 - 언어 변경은 로컬에서 이미 완료됨
      }
    }

    // 4. 페이지 새로고침 (새 언어 적용)
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1",
        isPending && "opacity-50 pointer-events-none",
        className
      )}
      role="radiogroup"
      aria-label="언어 선택"
    >
      <Globe
        className="h-4 w-4 text-muted-foreground ml-1"
        aria-hidden="true"
      />
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          role="radio"
          aria-checked={locale === loc}
          onClick={() => handleChange(loc)}
          disabled={isPending}
          className={cn(
            "px-2.5 py-1 text-sm font-medium rounded-md transition-colors",
            locale === loc
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {loc === "ko" ? "KOR" : "ENG"}
        </button>
      ))}
    </div>
  );
}
