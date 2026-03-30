/**
 * RESPONSE HELPERS
 * ────────────────────────────────────────────────────────────────────────────
 * Standard response shapes and message strings used across every controller.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/responses.ts
 */

// ── Message strings ───────────────────────────────────────────────────────────
export const ResponseMessage = {
  SUCCESS: 'Success',
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  NOT_FOUND: 'Record Not Found',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  CONFLICT: 'Conflict',
  INTERNAL_SERVER_ERROR: 'Something Went Wrong',
  INVALID_FILE: 'Invalid file provided',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  ALREADY_EXISTS: 'Record already exists',
  SIGNED_SUCCESSFULLY: 'Signed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
} as const;

// ── Response shape builders ────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const successResponse = <T>(
  data: T,
  message: string = ResponseMessage.SUCCESS,
  statusCode: number = 200,
  pagination?: PaginationMeta,
) => ({
  statusCode,
  message,
  data,
  pagination: pagination ?? null,
  error: null,
});

export const errorResponse = (
  message: string = ResponseMessage.INTERNAL_SERVER_ERROR,
  statusCode: number = 500,
  error: unknown = [],
) => ({
  statusCode,
  message,
  data: null,
  error,
});

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = ResponseMessage.SUCCESS,
) =>
  successResponse(data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
