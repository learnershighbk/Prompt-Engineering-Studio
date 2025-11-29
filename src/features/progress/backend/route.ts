import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  ProgressUserIdParamsSchema,
  UpsertProgressBodySchema,
} from '@/features/progress/backend/schema';
import {
  getProgressByUserId,
  upsertProgress,
  getCompletedCount,
} from './service';
import {
  progressErrorCodes,
  type ProgressServiceError,
} from './error';

export const registerProgressRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/progress/:userId', async (c) => {
    const parsedParams = ProgressUserIdParamsSchema.safeParse({
      userId: c.req.param('userId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PROGRESS_PARAMS',
          'The provided user id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getProgressByUserId(supabase, parsedParams.data.userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProgressServiceError, unknown>;

      if (errorResult.error.code === progressErrorCodes.fetchError) {
        logger.error('Failed to fetch progress', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.get('/api/progress/:userId/count', async (c) => {
    const parsedParams = ProgressUserIdParamsSchema.safeParse({
      userId: c.req.param('userId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PROGRESS_PARAMS',
          'The provided user id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCompletedCount(supabase, parsedParams.data.userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProgressServiceError, unknown>;

      if (errorResult.error.code === progressErrorCodes.fetchError) {
        logger.error('Failed to fetch progress count', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.post('/api/progress', async (c) => {
    const body = await c.req.json();
    const parsedBody = UpsertProgressBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PROGRESS_BODY',
          '진도 저장 데이터가 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await upsertProgress(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProgressServiceError, unknown>;

      if (errorResult.error.code === progressErrorCodes.upsertError) {
        logger.error('Failed to upsert progress', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
};

