import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  UserResponseSchema,
  UserTableRowSchema,
  type UserResponse,
  type UserRow,
  type CreateUserBody,
  type UpdateUserBody,
} from '@/features/users/backend/schema';
import {
  userErrorCodes,
  type UserServiceError,
} from '@/features/users/backend/error';

const USERS_TABLE = 'users';

const mapRowToResponse = (row: UserRow): UserResponse => ({
  id: row.id,
  studentId: row.student_id,
  userType: row.user_type,
  language: row.language,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getUserById = async (
  client: SupabaseClient,
  id: string,
): Promise<HandlerResult<UserResponse, UserServiceError, unknown>> => {
  const { data, error } = await client
    .from(USERS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle<UserRow>();

  if (error) {
    return failure(500, userErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, userErrorCodes.notFound, '사용자를 찾을 수 없습니다.');
  }

  const rowParse = UserTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = mapRowToResponse(rowParse.data);
  const parsed = UserResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getUserByStudentId = async (
  client: SupabaseClient,
  studentId: string,
): Promise<HandlerResult<UserResponse, UserServiceError, unknown>> => {
  const { data, error } = await client
    .from(USERS_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle<UserRow>();

  if (error) {
    return failure(500, userErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, userErrorCodes.notFound, '사용자를 찾을 수 없습니다.');
  }

  const rowParse = UserTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = mapRowToResponse(rowParse.data);
  const parsed = UserResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const createUser = async (
  client: SupabaseClient,
  body: CreateUserBody,
): Promise<HandlerResult<UserResponse, UserServiceError, unknown>> => {
  const { data, error } = await client
    .from(USERS_TABLE)
    .insert({
      student_id: body.studentId,
      user_type: body.userType,
      language: body.language,
    })
    .select('*')
    .single<UserRow>();

  if (error) {
    if (error.code === '23505') {
      return failure(409, userErrorCodes.duplicateStudentId, '이미 등록된 학번/사번입니다.');
    }
    return failure(500, userErrorCodes.createError, error.message);
  }

  const rowParse = UserTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = mapRowToResponse(rowParse.data);
  const parsed = UserResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const updateUser = async (
  client: SupabaseClient,
  id: string,
  body: UpdateUserBody,
): Promise<HandlerResult<UserResponse, UserServiceError, unknown>> => {
  const updateData: Record<string, unknown> = {};

  if (body.userType !== undefined) {
    updateData.user_type = body.userType;
  }

  if (body.language !== undefined) {
    updateData.language = body.language;
  }

  if (Object.keys(updateData).length === 0) {
    return getUserById(client, id);
  }

  const { data, error } = await client
    .from(USERS_TABLE)
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single<UserRow>();

  if (error) {
    return failure(500, userErrorCodes.updateError, error.message);
  }

  if (!data) {
    return failure(404, userErrorCodes.notFound, '사용자를 찾을 수 없습니다.');
  }

  const rowParse = UserTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = mapRowToResponse(rowParse.data);
  const parsed = UserResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      userErrorCodes.validationError,
      'User payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const findOrCreateUser = async (
  client: SupabaseClient,
  studentId: string,
): Promise<HandlerResult<UserResponse, UserServiceError, unknown>> => {
  const existingResult = await getUserByStudentId(client, studentId);

  if (existingResult.ok) {
    return existingResult;
  }

  if (existingResult.error.code !== userErrorCodes.notFound) {
    return existingResult;
  }

  return createUser(client, { studentId, userType: 'student', language: 'ko' });
};

