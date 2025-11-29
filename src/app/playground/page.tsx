"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import PromptEditor from "@/components/playground/PromptEditor";
import ResponseViewer from "@/components/playground/ResponseViewer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { Sparkles } from "lucide-react";

export default function PlaygroundPage() {
  const router = useRouter();
  const { userId, studentId, isAuthenticated, isLoading: authLoading } = useAuth();
  const { response, isLoading: chatLoading, error, sendPrompt, reset } = useChat();
  const { language, t, isLoaded: languageLoaded } = useLanguage();

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleExecute = () => {
    if (prompt.trim()) {
      sendPrompt(prompt);
    }
  };

  const handleReset = () => {
    setPrompt("");
    reset();
  };

  if (authLoading || !languageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBackButton studentId={studentId || undefined} />

      <main className="flex-1 container py-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("playground.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "ko"
                  ? "자유롭게 프롬프트를 실험해보세요"
                  : "Experiment with prompts freely"}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 flex-1 min-h-0">
          <div className="flex flex-col min-h-[500px]">
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {language === "ko" ? "프롬프트 입력" : "Prompt Input"}
                </span>
              </div>
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleExecute}
                isLoading={chatLoading}
                className="flex-1"
              />
            </div>
          </div>

          <div className="min-h-[500px]">
            <ResponseViewer
              content={response}
              isStreaming={chatLoading}
              className="h-full"
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {language === "ko" ? "프롬프트 입력" : "Prompt Input"}
              </span>
            </div>
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleExecute}
              isLoading={chatLoading}
            />
          </div>

          <ResponseViewer
            content={response}
            isStreaming={chatLoading}
            className="min-h-[300px] flex-1"
          />
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            {language === "ko" ? "💡 팁" : "💡 Tips"}
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            {language === "ko" ? (
              <>
                <li>• Ctrl/Cmd + Enter로 빠르게 실행할 수 있습니다</li>
                <li>• 구체적인 요구사항을 명시하면 더 좋은 결과를 얻을 수 있습니다</li>
                <li>• 출력 형식(표, 목록, 단락)을 지정해보세요</li>
              </>
            ) : (
              <>
                <li>• Press Ctrl/Cmd + Enter to execute quickly</li>
                <li>• Specific requirements yield better results</li>
                <li>• Try specifying output format (table, list, paragraph)</li>
              </>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

