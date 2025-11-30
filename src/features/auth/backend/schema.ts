import { z } from 'zod';
import { UserTypeEnum, LanguageEnum } from '@/features/users/backend/schema';

export const AuthRequestSchema = z.object({
  studentId: z
    .string()
    .regex(/^\d{9}$/, { message: '학번 또는 사번은 9자리 숫자입니다' }),
});

export type AuthRequest = z.infer<typeof AuthRequestSchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string(),
  userType: UserTypeEnum,
  language: LanguageEnum,
  createdAt: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  isNewUser: z.boolean(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;





