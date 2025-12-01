import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  UserTableRowSchema,
  type UserRow,
} from '@/features/users/backend/schema';
import {
  authErrorCodes,
  type AuthServiceError,
} from '@/features/auth/backend/error';
import type { AuthResponse, AuthUser } from '@/features/auth/backend/schema';

const USERS_TABLE = 'users';

const mapRowToAuthUser = (row: UserRow): AuthUser => ({
  id: row.id,
  studentId: row.student_id,
  userType: row.user_type,
  language: row.language,
  createdAt: row.created_at,
});

export const authenticateUser = async (
  client: SupabaseClient,
  studentId: string,
): Promise<HandlerResult<AuthResponse, AuthServiceError, unknown>> => {
  const { data: existingData, error: fetchError } = await client
    .from(USERS_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle<UserRow>();

  if (fetchError) {
    return failure(500, authErrorCodes.authError, fetchError.message);
  }

  if (existingData) {
    const rowParse = UserTableRowSchema.safeParse(existingData);

    if (!rowParse.success) {
      return failure(
        500,
        authErrorCodes.authError,
        '사용자 데이터 검증 실패',
        rowParse.error.format(),
      );
    }

    return success({
      user: mapRowToAuthUser(rowParse.data),
      isNewUser: false,
    });
  }

  const { data: newData, error: insertError } = await client
    .from(USERS_TABLE)
    .insert({
      student_id: studentId,
      user_type: 'student',
      language: 'ko',
    })
    .select('*')
    .single<UserRow>();

  if (insertError) {
    return failure(500, authErrorCodes.authError, insertError.message);
  }

  const rowParse = UserTableRowSchema.safeParse(newData);

  if (!rowParse.success) {
    return failure(
      500,
      authErrorCodes.authError,
      '사용자 데이터 검증 실패',
      rowParse.error.format(),
    );
  }

  return success(
    {
      user: mapRowToAuthUser(rowParse.data),
      isNewUser: true,
    },
    201,
  );
};






