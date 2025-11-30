import { z } from 'zod';

export const MAX_PROMPT_LENGTH = 4000;

export const ChatRequestSchema = z.object({
  userId: z.string().uuid({ message: 'User id must be a valid UUID.' }),
  prompt: z
    .string()
    .min(1, { message: '프롬프트를 입력해주세요' })
    .max(MAX_PROMPT_LENGTH, {
      message: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이내여야 합니다`,
    }),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatStreamChunkSchema = z.object({
  content: z.string(),
});

export type ChatStreamChunk = z.infer<typeof ChatStreamChunkSchema>;


