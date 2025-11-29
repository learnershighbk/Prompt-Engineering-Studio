"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import LessonCard from "@/components/learn/LessonCard";
import ProgressBar from "@/components/learn/ProgressBar";
import { LoadingSpinner } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";
import { getLessons } from "@/lib/lessons";

export default function LearnPage() {
  const router = useRouter();
  const { userId, studentId, isAuthenticated, isLoading: authLoading } = useAuth();
  const { summary, isCompleted, isLoading: progressLoading } = useProgress(userId);
  const { language, t, isLoaded: languageLoaded } = useLanguage();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

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

  const lessons = getLessons(language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header showPlaygroundLink studentId={studentId || undefined} />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t("learn.title")}
            </h1>
            <p className="text-gray-500">
              {language === "ko"
                ? "정책 분석을 위한 Prompt Engineering 핵심 기법을 학습하세요"
                : "Learn essential Prompt Engineering techniques for policy analysis"}
            </p>
          </div>

          <ProgressBar
            completed={summary.completed}
            total={summary.total}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                slug={lesson.slug}
                title={lesson.title}
                description={lesson.description}
                duration={lesson.duration}
                isCompleted={isCompleted(lesson.slug)}
                order={lesson.order}
              />
            ))}
          </div>

          {progressLoading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

