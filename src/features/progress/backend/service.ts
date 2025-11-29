import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ProgressResponseSchema,
  ProgressTableRowSchema,
  LessonSlugEnum,
  type ProgressResponse,
  type ProgressRow,
  type UpsertProgressBody,
  type ProgressSummary,
  type ProgressApiResponse,
  type SaveProgressResponse,
} from '@/features/progress/backend/schema';
import {
  progressErrorCodes,
  type ProgressServiceError,
} from '@/features/progress/backend/error';

const PROGRESS_TABLE = 'progress';
const TOTAL_LESSONS = LessonSlugEnum.options.length;
const ALL_LESSON_SLUGS = LessonSlugEnum.options;

const mapRowToResponse = (row: ProgressRow): ProgressResponse => ({
  id: row.id,
  userId: row.user_id,
  lessonSlug: row.lesson_slug,
  completed: row.completed,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getProgressByUserId = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ProgressSummary, ProgressServiceError, unknown>> => {
  const { data, error } = await client
    .from(PROGRESS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return failure(500, progressErrorCodes.fetchError, error.message);
  }

  const rows = data ?? [];
  const progressList: ProgressResponse[] = [];

  for (const row of rows) {
    const rowParse = ProgressTableRowSchema.safeParse(row);

    if (!rowParse.success) {
      return failure(
        500,
        progressErrorCodes.validationError,
        'Progress row failed validation.',
        rowParse.error.format(),
      );
    }

    const mapped = mapRowToResponse(rowParse.data);
    const parsed = ProgressResponseSchema.safeParse(mapped);

    if (!parsed.success) {
      return failure(
        500,
        progressErrorCodes.validationError,
        'Progress payload failed validation.',
        parsed.error.format(),
      );
    }

    progressList.push(parsed.data);
  }

  const completedLessons = progressList.filter((p) => p.completed).length;

  return success({
    totalLessons: TOTAL_LESSONS,
    completedLessons,
    progressList,
  });
};

export const upsertProgress = async (
  client: SupabaseClient,
  body: UpsertProgressBody,
): Promise<HandlerResult<ProgressResponse, ProgressServiceError, unknown>> => {
  const completedAt = body.completed ? new Date().toISOString() : null;

  const { data, error } = await client
    .from(PROGRESS_TABLE)
    .upsert(
      {
        user_id: body.userId,
        lesson_slug: body.lessonSlug,
        completed: body.completed,
        completed_at: completedAt,
      },
      {
        onConflict: 'user_id,lesson_slug',
      },
    )
    .select('*')
    .single<ProgressRow>();

  if (error) {
    if (error.code === '23503') {
      return failure(404, progressErrorCodes.userNotFound, '사용자를 찾을 수 없습니다.');
    }
    return failure(500, progressErrorCodes.upsertError, error.message);
  }

  const rowParse = ProgressTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      progressErrorCodes.validationError,
      'Progress row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = mapRowToResponse(rowParse.data);
  const parsed = ProgressResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      progressErrorCodes.validationError,
      'Progress payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getCompletedCount = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<{ completedCount: number; totalLessons: number }, ProgressServiceError, unknown>> => {
  const { count, error } = await client
    .from(PROGRESS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true);

  if (error) {
    return failure(500, progressErrorCodes.fetchError, error.message);
  }

  return success({
    completedCount: count ?? 0,
    totalLessons: TOTAL_LESSONS,
  });
};

export const getProgressForApi = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ProgressApiResponse, ProgressServiceError, unknown>> => {
  const { data, error } = await client
    .from(PROGRESS_TABLE)
    .select('lesson_slug, completed, completed_at')
    .eq('user_id', userId);

  if (error) {
    return failure(500, progressErrorCodes.fetchError, error.message);
  }

  const rows = data ?? [];
  const progressMap = new Map(
    rows.map((row) => [row.lesson_slug, row])
  );

  const progress = ALL_LESSON_SLUGS.map((slug) => ({
    lessonSlug: slug,
    completed: progressMap.get(slug)?.completed ?? false,
    completedAt: progressMap.get(slug)?.completed_at ?? null,
  }));

  const completedCount = progress.filter((p) => p.completed).length;

  return success({
    progress,
    summary: {
      total: TOTAL_LESSONS,
      completed: completedCount,
    },
  });
};

export const saveProgressForApi = async (
  client: SupabaseClient,
  body: UpsertProgressBody,
): Promise<HandlerResult<SaveProgressResponse, ProgressServiceError, unknown>> => {
  const completedAt = body.completed ? new Date().toISOString() : null;

  const { data, error } = await client
    .from(PROGRESS_TABLE)
    .upsert(
      {
        user_id: body.userId,
        lesson_slug: body.lessonSlug,
        completed: body.completed,
        completed_at: completedAt,
      },
      {
        onConflict: 'user_id,lesson_slug',
      },
    )
    .select('lesson_slug, completed, completed_at')
    .single();

  if (error) {
    if (error.code === '23503') {
      return failure(404, progressErrorCodes.userNotFound, '사용자를 찾을 수 없습니다.');
    }
    return failure(500, progressErrorCodes.upsertError, error.message);
  }

  return success({
    success: true,
    progress: {
      lessonSlug: data.lesson_slug,
      completed: data.completed,
      completedAt: data.completed_at,
    },
  });
};

