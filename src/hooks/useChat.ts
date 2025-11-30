"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

interface ChatState {
  response: string;
  isLoading: boolean;
  error: string | null;
}

export function useChat() {
  const { userId } = useAuth();
  const [state, setState] = useState<ChatState>({
    response: "",
    isLoading: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendPrompt = useCallback(async (prompt: string) => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "로그인이 필요합니다",
      }));
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      response: "",
      isLoading: true,
      error: null,
    });

    try {
      console.log("Sending prompt to API:", { userId, prompt });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, prompt }),
        signal: abortControllerRef.current.signal,
      });

      console.log("API response status:", response.status, response.ok);
      console.log("API response headers:", response.headers.get("content-type"));

      if (!response.ok) {
        let errorMessage = `요청에 실패했습니다 (${response.status})`;
        
        // 429 에러에 대한 기본 메시지
        if (response.status === 429) {
          errorMessage = 'API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            console.error("API error response:", JSON.stringify(errorData, null, 2));
            
            // 다양한 에러 응답 형식 지원
            if (errorData?.error?.message) {
              errorMessage = errorData.error.message;
            } else if (errorData?.error && typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData?.error) {
              // error가 객체인 경우 message를 찾거나 기본 메시지 사용
              const errorObj = errorData.error;
              if (typeof errorObj === 'object' && errorObj !== null) {
                errorMessage = (errorObj as { message?: string }).message || errorMessage;
              }
            }
          } else {
            const text = await response.text();
            console.error("API error (non-JSON):", { 
              status: response.status, 
              statusText: response.statusText,
              body: text.substring(0, 200) 
            });
            if (text) {
              errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text;
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        
        console.error("Final error message:", errorMessage);
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("Response body is null or undefined");
        throw new Error("스트림을 읽을 수 없습니다");
      }

      console.log("Starting to read stream...");

      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      let buffer = "";
      let isDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // 마지막 줄은 완전하지 않을 수 있으므로 버퍼에 남김
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6).trim();
            if (data === "[DONE]") {
              isDone = true;
              break;
            }

            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedResponse += parsed.content;
                console.log("Received content chunk, total length:", accumulatedResponse.length);
                setState((prev) => ({
                  ...prev,
                  response: accumulatedResponse,
                }));
              }
              if (parsed.error) {
                const errorMsg = typeof parsed.error === 'string' 
                  ? parsed.error 
                  : parsed.error?.message || '스트림 처리 중 오류가 발생했습니다';
                console.error("Stream error received:", errorMsg);
                throw new Error(errorMsg);
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              console.warn("Failed to parse SSE data:", data, parseError);
            }
          }
        }

        if (isDone) break;
      }

      console.log("Stream completed. Final response length:", accumulatedResponse.length);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        response: accumulatedResponse,
      }));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const message =
        err instanceof Error ? err.message : "AI 응답 생성에 실패했습니다";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [userId]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      response: "",
      isLoading: false,
      error: null,
    });
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  return {
    ...state,
    sendPrompt,
    reset,
    stopStreaming,
  };
}


