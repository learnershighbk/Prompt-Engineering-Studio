"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const USER_ID_KEY = "prompt-lab-user-id";
const STUDENT_ID_KEY = "prompt-lab-student-id";

interface AuthState {
  userId: string | null;
  studentId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    userId: null,
    studentId: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const userId = localStorage.getItem(USER_ID_KEY);
    const studentId = localStorage.getItem(STUDENT_ID_KEY);

    setState({
      userId,
      studentId,
      isAuthenticated: !!userId,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(STUDENT_ID_KEY);
    setState({
      userId: null,
      studentId: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.replace("/");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.replace("/");
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  return {
    ...state,
    logout,
    requireAuth,
  };
}





