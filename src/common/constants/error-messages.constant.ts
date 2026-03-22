/**
 * ERROR_MESSAGES
 * ────────────────────────────────────────────────────────────────────────────
 * All human-readable error strings in one place — never hard-code error text
 * inside services or controllers.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/errorMessages.ts
 */
export const ErrorMessages = {
  // ── Auth ────────────────────────────────────────────────────────────────
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    TOKEN_INVALID: 'Invalid or malformed token.',
    TOKEN_MISSING: 'Authorization token is missing.',
    ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
    ACCOUNT_BLOCKED: 'Your account has been blocked.',
    EMAIL_NOT_VERIFIED: 'Please verify your email before signing in.',
    SAME_PASSWORD: 'New password must be different from the current password.',
  },

  // ── User ────────────────────────────────────────────────────────────────
  USER: {
    NOT_FOUND: 'User not found.',
    EMAIL_EXISTS: 'An account with this email already exists.',
    INVALID_ROLE: 'Invalid user role specified.',
    CANNOT_DELETE_SELF: 'You cannot delete your own account.',
  },

  // ── Task ────────────────────────────────────────────────────────────────
  TASK: {
    NOT_FOUND: 'Task not found.',
    ALREADY_COMPLETED: 'Task is already completed.',
    INVALID_STATUS: 'Invalid task status transition.',
  },

  // ── Learning Activity ───────────────────────────────────────────────────
  ACTIVITY: {
    NOT_FOUND: 'Learning activity not found.',
    INVALID_METHOD: 'Invalid learning method.',
  },

  // ── Evidence ────────────────────────────────────────────────────────────
  EVIDENCE: {
    NOT_FOUND: 'Evidence record not found.',
    FOLDER_NOT_FOUND: 'Folder not found.',
    INVALID_FILE_TYPE: 'Unsupported file type.',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  },

  // ── Visit ───────────────────────────────────────────────────────────────
  VISIT: {
    NOT_FOUND: 'Visit record not found.',
  },

  // ── Progress Review ─────────────────────────────────────────────────────
  PROGRESS_REVIEW: {
    NOT_FOUND: 'Progress review not found.',
    ALREADY_SIGNED: 'This document has already been signed.',
    NOT_AUTHORISED_TO_SIGN: 'You are not authorised to sign this document.',
  },

  // ── Plan of Activity ────────────────────────────────────────────────────
  PLAN_OF_ACTIVITY: {
    NOT_FOUND: 'Plan of activity not found.',
    SESSION_NOT_FOUND: 'Session not found.',
  },

  // ── Generic ─────────────────────────────────────────────────────────────
  GENERIC: {
    NOT_FOUND: 'Record not found.',
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    VALIDATION_FAILED: 'Validation failed. Please check the submitted data.',
  },
} as const;
