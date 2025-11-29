"use client";

import { useState, useEffect, useCallback } from "react";
import { Language, getMessage } from "@/constants/messages";

const LANGUAGE_KEY = "prompt-lab-language";

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("ko");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (stored && (stored === "ko" || stored === "en")) {
      setLanguageState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return getMessage(language, path, params);
    },
    [language]
  );

  return {
    language,
    setLanguage,
    t,
    isLoaded,
  };
}

