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

  // ── Learning Journals ─────────────────────────────────────────────────────
  LEARNING_JOURNALS: 'learning-journals',

  // ── Courses ────────────────────────────────────────────────────────────────
  COURSES: 'courses',

  // ── Feedback & Comments ───────────────────────────────────────────────────
  FEEDBACK_COMMENTS: 'learning-activities/feedback-comments',

  // ── Declaration ────────────────────────────────────────────────────────────
  DECLARATION: 'learning-activities/declaration',

  // ── Criteria ───────────────────────────────────────────────────────────────
  CRITERIA: 'criteria',

  // ── Timesheet Entries ──────────────────────────────────────────────────────
  TIMESHEET_ENTRIES: 'learning-activities/timesheet',

  // ── Resources ──────────────────────────────────────────────────────────────
  RESOURCES: 'resources',

  // ── Forms ──────────────────────────────────────────────────────────────────
  LEARNER_FEEDBACK:  'forms/learner-feedback',
  EXIT_REVIEW:       'forms/exit-review',
  LEARNING_SUPPORT:  'forms/learning-support',
} as const;
