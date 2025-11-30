export const chatErrorCodes = {
  promptTooLong: 'PROMPT_TOO_LONG',
  aiApiError: 'AI_API_ERROR',
  missingPrompt: 'MISSING_PROMPT',
} as const;

type ChatErrorValue = (typeof chatErrorCodes)[keyof typeof chatErrorCodes];

export type ChatServiceError = ChatErrorValue;


