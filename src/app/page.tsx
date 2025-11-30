"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IdInput from "@/components/auth/IdInput";
import LanguageToggle from "@/components/common/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { Beaker, Sparkles } from "lucide-react";

const USER_ID_KEY = "prompt-lab-user-id";
const STUDENT_ID_KEY = "prompt-lab-student-id";

export default function LoginPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
      router.replace("/learn");
    }
  }, [router]);

  const handleSubmit = async (studentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth", { studentId });
      const data = response.data;

      if (data?.user) {
        localStorage.setItem(USER_ID_KEY, data.user.id);
        localStorage.setItem(STUDENT_ID_KEY, data.user.studentId);
        router.push("/learn");
      } else {
        setError(t("login.loginFailed"));
      }
    } catch (err) {
      const message = extractApiErrorMessage(err, t("login.loginFailed"));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-pulse">
          <Beaker className="h-12 w-12 text-blue-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Beaker className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {t("login.title")}
              </h1>
              <p className="text-lg text-gray-600">{t("login.subtitle")}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            <IdInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>
              {language === "ko"
                ? "AI 기반 프롬프트 엔지니어링 학습"
                : "AI-powered Prompt Engineering Learning"}
            </span>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-400">
        <p>© 2025 Prompt Lab. KDI School of Public Policy and Management</p>
      </footer>
    </main>
  );
}
