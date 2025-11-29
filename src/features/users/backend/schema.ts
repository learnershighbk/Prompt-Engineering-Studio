import { z } from 'zod';

export const UserTypeEnum = z.enum(['student', 'staff']);
export const LanguageEnum = z.enum(['ko', 'en']);

export const UserParamsSchema = z.object({
  id: z.string().uuid({ message: 'User id must be a valid UUID.' }),
});

export const StudentIdParamsSchema = z.object({
  studentId: z.string().length(9, { message: '학번/사번은 9자리여야 합니다.' }),
});

export const CreateUserBodySchema = z.object({
  studentId: z.string().length(9, { message: '학번/사번은 9자리여야 합니다.' }),
  userType: UserTypeEnum.optional().default('student'),
  language: LanguageEnum.optional().default('ko'),
});

export const UpdateUserBodySchema = z.object({
  userType: UserTypeEnum.optional(),
  language: LanguageEnum.optional(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string(),
  userType: UserTypeEnum,
  language: LanguageEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const UserTableRowSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string(),
  user_type: UserTypeEnum,
  language: LanguageEnum,
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserRow = z.infer<typeof UserTableRowSchema>;

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;

