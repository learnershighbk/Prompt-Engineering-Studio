import { z } from 'zod';

export const LessonSlugEnum = z.enum(['intro', 'zero-shot', 'few-shot', 'chain-of-thought']);

export const ProgressUserIdParamsSchema = z.object({
  userId: z.string().uuid({ message: 'User id must be a valid UUID.' }),
});

export const UpsertProgressBodySchema = z.object({
  userId: z.string().uuid({ message: 'User id must be a valid UUID.' }),
  lessonSlug: LessonSlugEnum,
  completed: z.boolean().optional().default(true),
});

export const ProgressResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lessonSlug: z.string(),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;

export const ProgressTableRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  lesson_slug: z.string(),
  completed: z.boolean(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProgressRow = z.infer<typeof ProgressTableRowSchema>;

export type UpsertProgressBody = z.infer<typeof UpsertProgressBodySchema>;

export const ProgressSummarySchema = z.object({
  totalLessons: z.number(),
  completedLessons: z.number(),
  progressList: z.array(ProgressResponseSchema),
});

export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;

