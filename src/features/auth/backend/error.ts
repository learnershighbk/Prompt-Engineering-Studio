export const authErrorCodes = {
  invalidStudentId: 'INVALID_STUDENT_ID',
  authError: 'AUTH_ERROR',
} as const;

type AuthErrorValue = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = AuthErrorValue;

