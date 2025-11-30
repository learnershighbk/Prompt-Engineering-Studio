import type { Hono } from 'hono';
import { stream as streamResponse } from 'hono/streaming';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropic } from '@/lib/anthropic';
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
      let anthropic;
      try {
        anthropic = getAnthropic();
      } catch (anthropicError) {
        logger.error('Anthropic initialization error', String(anthropicError));
        return c.json(
          {
            error: {
              code: chatErrorCodes.aiApiError,
              message: 'AI 서비스 초기화에 실패했습니다. 환경 변수를 확인해주세요.',
            },
          },
          500
        );
      }

      const anthropicStream = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
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

      const encoder = new TextEncoder();

      return streamResponse(c, async (streamWriter) => {
        try {
          let chunkCount = 0;
          for await (const chunk of anthropicStream) {
            chunkCount++;
            
            if (chunk.type === 'content_block_delta') {
              const delta = chunk.delta;
              // delta.type이 'text_delta'이고 text 필드가 있는 경우
              if (delta && delta.type === 'text_delta' && 'text' in delta) {
                const content = delta.text;
                if (content && typeof content === 'string') {
                  const data = `data: ${JSON.stringify({ content })}\n\n`;
                  await streamWriter.write(encoder.encode(data));
                }
              } else {
                logger.debug('Skipping non-text delta:', { deltaType: delta?.type });
              }
            } else {
              logger.debug('Skipping non-delta chunk:', { chunkType: chunk.type });
            }
          }
          
          logger.info('Stream completed', { totalChunks: chunkCount });
          await streamWriter.write(encoder.encode('data: [DONE]\n\n'));
        } catch (streamError) {
          logger.error('Stream error', String(streamError));
          const errorMessage = streamError instanceof Error 
            ? streamError.message 
            : 'Stream interrupted';
          const errorData = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
          await streamWriter.write(encoder.encode(errorData));
        }
      });
    } catch (error) {
      logger.error('Anthropic API error', String(error));

      // Anthropic API 에러 타입 확인
      let statusCode: number | undefined;
      let errorMessage = 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';

      if (error instanceof Anthropic.APIError) {
        statusCode = error.status;
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'status' in error) {
        statusCode = (error as { status?: number }).status;
        errorMessage = error instanceof Error ? error.message : String(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // 429: 할당량 초과 (RateLimitError 또는 status 429)
      if (statusCode === 429 || error instanceof Anthropic.RateLimitError) {
        return c.json(
          {
            error: {
              code: chatErrorCodes.aiApiQuotaExceeded,
              message: 'API 할당량을 초과했습니다. 요금제 및 결제 정보를 확인해주세요.',
            },
          },
          429
        );
      }

      // 401: 인증 오류
      if (statusCode === 401 || error instanceof Anthropic.AuthenticationError) {
        return c.json(
          {
            error: {
              code: chatErrorCodes.aiApiAuthenticationError,
              message: 'API 인증에 실패했습니다. API 키를 확인해주세요.',
            },
          },
          401
        );
      }

      // 기타 에러는 500으로 처리
      return c.json(
        {
          error: {
            code: chatErrorCodes.aiApiError,
            message: errorMessage,
          },
        },
        500
      );
    }
  });
};


