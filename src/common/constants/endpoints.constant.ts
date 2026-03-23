/**
 * API_ENDPOINTS
 * ────────────────────────────────────────────────────────────────────────────
 * All route path segments grouped by domain.
 * Used inside @Get(), @Post(), @Patch(), @Delete() decorators — NEVER
 * hard-code path strings anywhere else.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/endpoints.ts
 */
export const API_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    SIGNUP: 'signup',
    SIGNIN: 'signin',
    SIGNOUT: 'signout',
    REFRESH_TOKEN: 'refresh-token',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
    CHANGE_PASSWORD: 'change-password',
    VERIFY_TOKEN: 'verify-token',
    ME: 'me',
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    UPLOAD_AVATAR: 'avatar',
    SEARCH: 'search',
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASKS: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    DELETE_MULTIPLE: 'bulk-delete',
    STATUS_UPDATE: '/:id/status',
    ASSIGN: '/:id/assign',
  },

  // ── Learning Activities ───────────────────────────────────────────────────
  LEARNING_ACTIVITIES: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    STATUS_UPDATE: '/:id/status',
  },

  // ── Timesheet ────────────────────────────────────────────────────────────
  TIMESHEET: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    STATS: 'stats',
    STATS_BY_ACTIVITY: '/activity/:activityId/stats',
    BY_ACTIVITY: '/activity/:activityId',
  },

  // ── Evidence ─────────────────────────────────────────────────────────────
  EVIDENCE: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    UPLOAD: 'upload',
    DELETE: '/:id',
    FOLDERS: 'folders',
    CREATE_FOLDER: 'folders',
    DELETE_FOLDER: 'folders/:id',
    CREATE_LINK: 'links',
  },

  // ── Visit ─────────────────────────────────────────────────────────────────
  VISIT: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
  },

  // ── Progress Review ───────────────────────────────────────────────────────
  PROGRESS_REVIEW: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    UNITS: 'units',
    DECLARATIONS: 'declarations',
    KSC_MAPPING: 'ksc-mapping',
    SIGN: '/:id/sign',
  },

  // ── Plan of Activity ─────────────────────────────────────────────────────
  PLAN_OF_ACTIVITY: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    SIGN: '/:id/sign',
    SCHEDULE: '/:id/schedule',
  },

  // ── My Account ────────────────────────────────────────────────────────────
  MY_ACCOUNT: {
    GET: '/',
    UPDATE_PERSONAL: 'personal',
    UPDATE_PASSWORD: 'password',
    UPLOAD_AVATAR: 'avatar',
  },

  // ── Activity Log ─────────────────────────────────────────────────────────
  ACTIVITY_LOG: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    EXPORT: 'export',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: {
    STATS: 'stats',
    RECENT_ACTIVITY: 'recent-activity',
    CHART_DATA: 'chart-data',
    CALENDAR: 'calendar',
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  MESSAGES: {
    GET_ALL: '/',
    SEND: '/',
    CONVERSATION: '/conversation/:userId',
    CONVERSATIONS_LIST: '/conversations',
    UNREAD_COUNT: '/unread-count',
    DELETE: '/:id',
    SEARCH_CONTACTS: 'contacts/search',
    AVAILABLE_CONTACTS: '/contacts/available',
    STREAM: '/stream',
  },

  // ── Progress Review (delete) ──────────────────────────────────────────────
  // (Already includes DELETE via UPDATE, added separately for clarity)

  // ── Plan of Activity ─────────────────────────────────────────────────────
  // Already defined above; DELETE added below if not present

  // ── Learning Journals ─────────────────────────────────────────────────────
  LEARNING_JOURNALS: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
  },

  // ── Courses ────────────────────────────────────────────────────────────────
  COURSES: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    ENROLL: '/:id/enroll',
    ENROLLMENTS: '/:id/enrollments',
    UNENROLL: '/:id/enroll/:userId',
  },

  // ── Feedback & Comments ───────────────────────────────────────────────────
  FEEDBACK_COMMENTS: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
  },

  // ── Declaration ────────────────────────────────────────────────────────────
  DECLARATION: {
    GET: '/:activityId',
    UPSERT: '/:activityId',
    SIGN: '/:activityId/sign',
  },

  // ── Criteria ───────────────────────────────────────────────────────────────
  CRITERIA: {
    GET_ALL: '/',
    GET_ONE: '/:id',
    CREATE: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
    GET_FOR_ACTIVITY: '/activity/:activityId',
    SET_FOR_ACTIVITY: '/activity/:activityId',
  },
} as const;
