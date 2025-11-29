export const progressErrorCodes = {
  notFound: 'PROGRESS_NOT_FOUND',
  fetchError: 'PROGRESS_FETCH_ERROR',
  upsertError: 'PROGRESS_UPSERT_ERROR',
  validationError: 'PROGRESS_VALIDATION_ERROR',
  userNotFound: 'PROGRESS_USER_NOT_FOUND',
} as const;

type ProgressErrorValue = (typeof progressErrorCodes)[keyof typeof progressErrorCodes];

export type ProgressServiceError = ProgressErrorValue;

