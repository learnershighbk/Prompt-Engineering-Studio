export const chatErrorCodes = {
  promptTooLong: 'PROMPT_TOO_LONG',
  aiApiError: 'AI_API_ERROR',
  aiApiQuotaExceeded: 'AI_API_QUOTA_EXCEEDED',
  aiApiAuthenticationError: 'AI_API_AUTHENTICATION_ERROR',
  missingPrompt: 'MISSING_PROMPT',
} as const;

type ChatErrorValue = (typeof chatErrorCodes)[keyof typeof chatErrorCodes];

export type ChatServiceError = ChatErrorValue;


