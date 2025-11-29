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
  LessonSlugEnum,
} from '@/features/progress/backend/schema';
import {
  getProgressByUserId,
  upsertProgress,
  getCompletedCount,
  getProgressForApi,
  saveProgressForApi,
} from './service';
import {
  progressErrorCodes,
  type ProgressServiceError,
} from './error';

export const registerProgressRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/progress', async (c) => {
    const userId = c.req.query('userId');

    if (!userId) {
      return respond(
        c,
        failure(
          400,
          progressErrorCodes.missingUserId,
          'userId가 필요합니다',
        ),
      );
    }

    const parsedParams = ProgressUserIdParamsSchema.safeParse({ userId });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          progressErrorCodes.missingUserId,
          'userId가 유효하지 않습니다',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getProgressForApi(supabase, parsedParams.data.userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProgressServiceError, unknown>;

      if (errorResult.error.code === progressErrorCodes.fetchError) {
        logger.error('Failed to fetch progress', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.post('/api/progress', async (c) => {
    const body = await c.req.json();
    const parsedBody = UpsertProgressBodySchema.safeParse(body);

    if (!parsedBody.success) {
      const lessonSlugError = parsedBody.error.issues.find(
        (issue) => issue.path.includes('lessonSlug')
      );

      if (lessonSlugError) {
        return respond(
          c,
          failure(
            400,
            progressErrorCodes.invalidLesson,
            '유효하지 않은 학습 단원입니다',
            parsedBody.error.format(),
          ),
        );
      }

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

    const result = await saveProgressForApi(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProgressServiceError, unknown>;

      if (errorResult.error.code === progressErrorCodes.upsertError) {
        logger.error('Failed to upsert progress', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

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
};

