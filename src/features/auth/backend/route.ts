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
import { AuthRequestSchema } from '@/features/auth/backend/schema';
import { authenticateUser } from '@/features/auth/backend/service';
import {
  authErrorCodes,
  type AuthServiceError,
} from '@/features/auth/backend/error';

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/auth', async (c) => {
    const body = await c.req.json();
    const parsedBody = AuthRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          authErrorCodes.invalidStudentId,
          '학번 또는 사번은 9자리 숫자입니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await authenticateUser(supabase, parsedBody.data.studentId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AuthServiceError, unknown>;
      logger.error('Auth failed', errorResult.error.message);
    }

    return respond(c, result);
  });
};






