"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/common/Header";
import LessonContent from "@/components/learn/LessonContent";
import PromptEditor from "@/components/playground/PromptEditor";
import ResponseViewer from "@/components/playground/ResponseViewer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { getLesson, getNextLesson, getPreviousLesson } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Terminal,
  Lightbulb,
} from "lucide-react";

interface LessonDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { userId, studentId, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isCompleted, markComplete, isLoading: progressLoading } = useProgress(userId);
  const { response, isLoading: chatLoading, sendPrompt, reset } = useChat();
  const { language, t, isLoaded: languageLoaded } = useLanguage();

  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "practice">("content");
  const [showHints, setShowHints] = useState(false);

  const lesson = languageLoaded ? getLesson(slug, language) : null;
  const nextLesson = languageLoaded ? getNextLesson(slug, language) : null;
  const prevLesson = languageLoaded ? getPreviousLesson(slug, language) : null;
  const completed = isCompleted(slug);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (lesson?.practice?.starterPrompt && !prompt) {
      setPrompt(lesson.practice.starterPrompt);
    }
  }, [lesson, prompt]);

  const handleTryExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setActiveTab("practice");
    reset();
  };

  const handleExecute = () => {
    if (prompt.trim()) {
      sendPrompt(prompt);
    }
  };

  const handleMarkComplete = () => {
    if (!completed) {
      markComplete(slug);
    }
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

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton studentId={studentId || undefined} />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "ko" ? "학습을 찾을 수 없습니다" : "Lesson not found"}
            </h1>
            <Link href="/learn">
              <Button variant="outline">
                {language === "ko" ? "학습 목록으로 돌아가기" : "Back to lessons"}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBackButton studentId={studentId || undefined} />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Link href="/learn" className="hover:text-gray-900 transition-colors">
              {t("learn.title")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{lesson.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <p className="text-gray-600 text-lg">{lesson.description}</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 md:h-[calc(100vh-280px)]">
          <div className="overflow-auto rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <LessonContent
              content={lesson.content}
              examples={lesson.examples}
              onTryExample={handleTryExample}
            />
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0 flex flex-col">
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleExecute}
                isLoading={chatLoading}
                className="h-[40%]"
              />
            </div>

            <div className="flex-1 min-h-0">
              <ResponseViewer
                content={response}
                isStreaming={chatLoading}
                className="h-full"
              />
            </div>

            {lesson.practice?.hints && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-800 w-full"
                >
                  <Lightbulb className="h-4 w-4" />
                  {language === "ko" ? "힌트 보기" : "Show hints"}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 ml-auto transition-transform",
                      showHints && "rotate-90"
                    )}
                  />
                </button>
                {showHints && (
                  <ul className="mt-3 space-y-1.5 text-sm text-amber-700">
                    {lesson.practice.hints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "content" | "practice")}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t("learn.content")}
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                {t("learn.practice")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <LessonContent
                  content={lesson.content}
                  examples={lesson.examples}
                  onTryExample={handleTryExample}
                />
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-0 space-y-4">
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleExecute}
                isLoading={chatLoading}
              />

              <ResponseViewer
                content={response}
                isStreaming={chatLoading}
                className="min-h-[300px]"
              />

              {lesson.practice?.hints && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-sm font-medium text-amber-800 w-full"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {language === "ko" ? "힌트 보기" : "Show hints"}
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 ml-auto transition-transform",
                        showHints && "rotate-90"
                      )}
                    />
                  </button>
                  {showHints && (
                    <ul className="mt-3 space-y-1.5 text-sm text-amber-700">
                      {lesson.practice.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 border-t border-gray-200 bg-white py-4">
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            <div>
              {prevLesson ? (
                <Link href={`/learn/${prevLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("common.previous")}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={completed}
                  onCheckedChange={handleMarkComplete}
                  disabled={progressLoading || completed}
                />
                <span className="text-sm font-medium">
                  {completed ? t("learn.completed") : t("learn.markComplete")}
                </span>
              </label>
            </div>

            <div>
              {nextLesson ? (
                <Link href={`/learn/${nextLesson.slug}`}>
                  <Button className="gap-2">
                    <span className="hidden sm:inline">{t("common.next")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/learn">
                  <Button className="gap-2">
                    <span>
                      {language === "ko" ? "학습 완료" : "Complete"}
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

