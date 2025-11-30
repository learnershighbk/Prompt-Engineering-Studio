import type { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { getOpenAI } from '@/lib/openai';
import {
  getLogger,
  type AppEnv,
} from '@/backend/hono/context';
import {
  ChatRequestSchema,
  MAX_PROMPT_LENGTH,
} from '@/features/chat/backend/schema';
import { chatErrorCodes } from '@/features/chat/backend/error';

const SYSTEM_PROMPT =
  "You are a helpful assistant for learning prompt engineering. Respond in the same language as the user's input.";

export const registerChatRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/chat', async (c) => {
    const logger = getLogger(c);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        {
          error: {
            code: chatErrorCodes.missingPrompt,
            message: '요청 데이터가 올바르지 않습니다',
          },
        },
        400
      );
    }

    const parsedBody = ChatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      const promptLengthError = parsedBody.error.issues.find(
        (issue) =>
          issue.path.includes('prompt') && issue.code === 'too_big'
      );

      if (promptLengthError) {
        return c.json(
          {
            error: {
              code: chatErrorCodes.promptTooLong,
              message: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이내여야 합니다`,
            },
          },
          400
        );
      }

      return c.json(
        {
          error: {
            code: chatErrorCodes.missingPrompt,
            message: '프롬프트를 입력해주세요',
          },
        },
        400
      );
    }

    const { prompt } = parsedBody.data;

    try {
      const openai = getOpenAI();

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      c.header('Content-Type', 'text/event-stream');
      c.header('Cache-Control', 'no-cache');
      c.header('Connection', 'keep-alive');

      return stream(c, async (streamWriter) => {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content ?? '';
            if (content) {
              await streamWriter.write(
                `data: ${JSON.stringify({ content })}\n\n`
              );
            }
          }
          await streamWriter.write('data: [DONE]\n\n');
        } catch (streamError) {
          logger.error('Stream error', String(streamError));
          await streamWriter.write(
            `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`
          );
        }
      });
    } catch (error) {
      logger.error('OpenAI API error', String(error));

      return c.json(
        {
          error: {
            code: chatErrorCodes.aiApiError,
            message: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
          },
        },
        500
      );
    }
  });
};


