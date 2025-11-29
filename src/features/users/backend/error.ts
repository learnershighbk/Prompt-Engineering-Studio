export const userErrorCodes = {
  notFound: 'USER_NOT_FOUND',
  fetchError: 'USER_FETCH_ERROR',
  createError: 'USER_CREATE_ERROR',
  updateError: 'USER_UPDATE_ERROR',
  validationError: 'USER_VALIDATION_ERROR',
  duplicateStudentId: 'USER_DUPLICATE_STUDENT_ID',
} as const;

type UserErrorValue = (typeof userErrorCodes)[keyof typeof userErrorCodes];

export type UserServiceError = UserErrorValue;

