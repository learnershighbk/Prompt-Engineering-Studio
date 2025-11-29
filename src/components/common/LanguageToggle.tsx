"use client";

import { Language } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  currentLanguage: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

export default function LanguageToggle({
  currentLanguage,
  onChange,
  className,
}: LanguageToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1",
        className
      )}
      role="radiogroup"
      aria-label="언어 선택"
    >
      <Globe className="h-4 w-4 text-muted-foreground ml-1" aria-hidden="true" />
      <button
        type="button"
        role="radio"
        aria-checked={currentLanguage === "ko"}
        onClick={() => onChange("ko")}
        className={cn(
          "px-2.5 py-1 text-sm font-medium rounded-md transition-colors",
          currentLanguage === "ko"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        KOR
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={currentLanguage === "en"}
        onClick={() => onChange("en")}
        className={cn(
          "px-2.5 py-1 text-sm font-medium rounded-md transition-colors",
          currentLanguage === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        ENG
      </button>
    </div>
  );
}

