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
  const { response, isLoading: chatLoading, error: chatError, sendPrompt, reset } = useChat();
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

  const handleReset = () => {
    setPrompt("");
    reset();
  };

  const starterPrompt = lesson?.practice?.starterPrompt || "";

  const handleMarkComplete = () => {
    if (!completed) {
      markComplete(slug);
    }
  };

  if (authLoading || !languageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton studentId={studentId || undefined} />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton studentId={studentId || undefined} />

      <main className="flex-1 container py-8 pb-32 md:pb-32">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/learn" className="hover:text-foreground transition-colors">
              {t("learn.title")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
          <p className="text-muted-foreground text-lg">{lesson.description}</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 md:max-h-[calc(100vh-320px)] md:min-h-[600px]">
          <div className="overflow-auto rounded-lg border border-border bg-card p-8 pb-32 shadow-sm">
            <LessonContent
              content={lesson.content}
              examples={lesson.examples}
              onTryExample={handleTryExample}
            />
          </div>

          <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm flex-shrink-0">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {language === "ko" ? "프롬프트 실습 Playground" : "Prompt Practice Playground"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {language === "ko"
                  ? "다음 프롬프트를 앞서 배운 내용을 토대로 더 좋은 품질의 결과를 도출 할 수 있도록 수정해보세요."
                  : "Modify the following prompt to derive better quality results based on what you've learned."}
              </p>
              {starterPrompt && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
                    {language === "ko" ? "프롬프트 예시:" : "Example Prompt:"}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-mono whitespace-pre-wrap">
                    {starterPrompt}
                  </p>
                </div>
              )}
              <div className="h-[300px] flex flex-col">
                <PromptEditor
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleExecute}
                  isLoading={chatLoading}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ResponseViewer
                content={response}
                isStreaming={chatLoading}
                className="flex-1 min-h-0 overflow-auto"
              />
              {chatError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
                  <p className="text-sm text-red-600 dark:text-red-400">{chatError}</p>
                </div>
              )}
            </div>

            {lesson.practice?.hints && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300 w-full"
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
                  <ul className="mt-3 space-y-1.5 text-sm text-amber-700 dark:text-amber-300">
                    {lesson.practice.hints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500 dark:text-amber-400">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-4 flex-shrink-0">
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
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm pb-32">
                <LessonContent
                  content={lesson.content}
                  examples={lesson.examples}
                  onTryExample={handleTryExample}
                />
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-0 space-y-4 pb-32">
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {language === "ko" ? "프롬프트 실습 Playground" : "Prompt Practice Playground"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === "ko"
                    ? "다음 프롬프트를 앞서 배운 내용을 토대로 더 좋은 품질의 결과를 도출 할 수 있도록 수정해보세요."
                    : "Modify the following prompt to derive better quality results based on what you've learned."}
                </p>
                {starterPrompt && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
                      {language === "ko" ? "프롬프트 예시:" : "Example Prompt:"}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-mono whitespace-pre-wrap">
                      {starterPrompt}
                    </p>
                  </div>
                )}
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
                className="w-full min-h-[200px]"
              />

              {chatError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{chatError}</p>
                </div>
              )}

              {lesson.practice?.hints && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300 w-full"
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
                    <ul className="mt-3 space-y-1.5 text-sm text-amber-700 dark:text-amber-300">
                      {lesson.practice.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-500 dark:text-amber-400">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="bg-card border border-border rounded-lg p-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card z-40 shadow-lg">
        <div className="container py-4">
          <div className="hidden md:block">
            {/* Desktop: 2-column grid layout matching main content */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex justify-start">
                {prevLesson ? (
                  <Link href={`/learn/${prevLesson.slug}`}>
                    <Button variant="outline" className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span>{t("common.previous")}</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
              <div className="flex justify-end">
                {nextLesson ? (
                  <Link href={`/learn/${nextLesson.slug}`}>
                    <Button className="gap-2">
                      <span>{t("common.next")}</span>
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
          <div className="md:hidden">
            {/* Mobile: full width layout */}
            <div className="flex items-center justify-between gap-4">
              <div>
                {prevLesson ? (
                  <Link href={`/learn/${prevLesson.slug}`}>
                    <Button variant="outline" className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span>{t("common.previous")}</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
              <div>
                {nextLesson ? (
                  <Link href={`/learn/${nextLesson.slug}`}>
                    <Button className="gap-2">
                      <span>{t("common.next")}</span>
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
        </div>
      </footer>
    </div>
  );
}

