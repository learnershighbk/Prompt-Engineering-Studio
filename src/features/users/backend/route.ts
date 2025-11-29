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
  UserParamsSchema,
  StudentIdParamsSchema,
  CreateUserBodySchema,
  UpdateUserBodySchema,
  UpdateLanguageBodySchema,
} from '@/features/users/backend/schema';
import {
  getUserById,
  getUserByStudentId,
  createUser,
  updateUser,
  findOrCreateUser,
  updateUserLanguage,
} from './service';
import {
  userErrorCodes,
  type UserServiceError,
} from './error';

export const registerUserRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/users/:id', async (c) => {
    const parsedParams = UserParamsSchema.safeParse({ id: c.req.param('id') });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_USER_PARAMS',
          'The provided user id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getUserById(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      if (errorResult.error.code === userErrorCodes.fetchError) {
        logger.error('Failed to fetch user', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.get('/api/users/student/:studentId', async (c) => {
    const parsedParams = StudentIdParamsSchema.safeParse({
      studentId: c.req.param('studentId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_STUDENT_ID',
          '학번/사번 형식이 올바르지 않습니다.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getUserByStudentId(supabase, parsedParams.data.studentId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      if (errorResult.error.code === userErrorCodes.fetchError) {
        logger.error('Failed to fetch user by student id', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.post('/api/users', async (c) => {
    const body = await c.req.json();
    const parsedBody = CreateUserBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_USER_BODY',
          '사용자 생성 데이터가 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createUser(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      if (errorResult.error.code === userErrorCodes.createError) {
        logger.error('Failed to create user', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.patch('/api/users/:id', async (c) => {
    const parsedParams = UserParamsSchema.safeParse({ id: c.req.param('id') });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_USER_PARAMS',
          'The provided user id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateUserBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_USER_BODY',
          '사용자 수정 데이터가 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateUser(supabase, parsedParams.data.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      if (errorResult.error.code === userErrorCodes.updateError) {
        logger.error('Failed to update user', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.post('/api/users/find-or-create', async (c) => {
    const body = await c.req.json();
    const parsedBody = StudentIdParamsSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_STUDENT_ID',
          '학번/사번 형식이 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await findOrCreateUser(supabase, parsedBody.data.studentId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;
      logger.error('Failed to find or create user', errorResult.error.message);
    }

    return respond(c, result);
  });

  app.patch('/api/user/language', async (c) => {
    const body = await c.req.json();
    const parsedBody = UpdateLanguageBodySchema.safeParse(body);

    if (!parsedBody.success) {
      const languageError = parsedBody.error.issues.find(
        (issue) => issue.path.includes('language')
      );

      if (languageError) {
        return respond(
          c,
          failure(
            400,
            userErrorCodes.invalidLanguage,
            '지원하지 않는 언어입니다',
            parsedBody.error.format(),
          ),
        );
      }

      return respond(
        c,
        failure(
          400,
          'INVALID_LANGUAGE_BODY',
          '언어 설정 데이터가 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateUserLanguage(
      supabase,
      parsedBody.data.userId,
      parsedBody.data.language,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;
      logger.error('Failed to update language', errorResult.error.message);
    }

    return respond(c, result);
  });
};

