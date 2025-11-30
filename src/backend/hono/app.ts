import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerUserRoutes } from '@/features/users/backend/route';
import { registerProgressRoutes } from '@/features/progress/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerChatRoutes } from '@/features/chat/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // development와 test 환경에서는 싱글톤을 초기화하여 HMR 및 mock이 적용되도록 함
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    singletonApp = null;
  }

  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerProgressRoutes(app);
  registerChatRoutes(app);

  singletonApp = app;

  return app;
};
