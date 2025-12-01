"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";

interface ProgressItem {
  lessonSlug: string;
  completed: boolean;
  completedAt: string | null;
}

interface ProgressSummary {
  total: number;
  completed: number;
}

interface ProgressState {
  progress: ProgressItem[];
  summary: ProgressSummary;
  isLoading: boolean;
  error: string | null;
}

export function useProgress(userId: string | null) {
  const [state, setState] = useState<ProgressState>({
    progress: [],
    summary: { total: 4, completed: 0 },
    isLoading: false,
    error: null,
  });

  const fetchProgress = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.get(`/api/progress?userId=${userId}`);
      const data = response.data;

      if (data.data) {
        setState({
          progress: data.data.progress || [],
          summary: data.data.summary || { total: 4, completed: 0 },
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      const message = extractApiErrorMessage(err, "진도를 불러올 수 없습니다");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [userId]);

  const markComplete = useCallback(
    async (lessonSlug: string) => {
      if (!userId) return;

      try {
        await apiClient.post("/api/progress", {
          userId,
          lessonSlug,
          completed: true,
        });
        await fetchProgress();
      } catch (err) {
        const message = extractApiErrorMessage(err, "저장에 실패했습니다");
        setState((prev) => ({ ...prev, error: message }));
      }
    },
    [userId, fetchProgress]
  );

  const isCompleted = useCallback(
    (lessonSlug: string) => {
      return state.progress.some(
        (p) => p.lessonSlug === lessonSlug && p.completed
      );
    },
    [state.progress]
  );

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId, fetchProgress]);

  return {
    ...state,
    fetchProgress,
    markComplete,
    isCompleted,
  };
}






