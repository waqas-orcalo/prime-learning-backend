/**
 * CONTROLLERS
 * ────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every @Controller() route prefix.
 * Use these constants instead of hard-coding strings, so a rename only
 * requires one change here.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/controllers.ts
 */
export const CONTROLLERS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: 'auth',

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: 'users',

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASKS: 'tasks',

  // ── Learning Activities ───────────────────────────────────────────────────
  LEARNING_ACTIVITIES: 'learning-activities',
  TIMESHEET: 'learning-activities/timesheet',
  EVIDENCE: 'learning-activities/evidence',
  VISIT: 'learning-activities/visit',

  // ── Progress & Plans ──────────────────────────────────────────────────────
  PROGRESS_REVIEW: 'progress-review',
  PLAN_OF_ACTIVITY: 'plan-of-activity',

  // ── Account ───────────────────────────────────────────────────────────────
  MY_ACCOUNT: 'my-account',

  // ── Utility ───────────────────────────────────────────────────────────────
  ACTIVITY_LOG: 'activity-log',
  SUPPORTED_FILE_FORMAT: 'supported-file-format',
  DASHBOARD: 'dashboard',
  MESSAGES: 'messages',

  // ── Courses ────────────────────────────────────────────────────────────────
  COURSES: 'courses',
} as const;
