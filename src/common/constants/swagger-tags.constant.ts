/**
 * API_TAGS
 * ────────────────────────────────────────────────────────────────────────────
 * Swagger @ApiTags() values – one constant per controller group.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/tags.ts
 */
export const API_TAGS = {
  AUTH: 'Authentication',
  USERS: 'Users',
  TASKS: 'Tasks',
  LEARNING_ACTIVITIES: 'Learning Activities',
  TIMESHEET: 'Timesheet (OTJ)',
  EVIDENCE: 'Evidence',
  VISIT: 'Visit',
  PROGRESS_REVIEW: 'Progress Review',
  PLAN_OF_ACTIVITY: 'Plan of Activity',
  MY_ACCOUNT: 'My Account',
  ACTIVITY_LOG: 'Activity Log',
  DASHBOARD: 'Dashboard',
  MESSAGES: 'Messages',
  COURSES: 'Courses',
  LEARNING_JOURNALS: 'Learning Journals',
  FEEDBACK_COMMENTS: 'Feedback & Comments',
  DECLARATION: 'Declaration & Signatures',
  CRITERIA: 'Criteria',
  RESOURCES: 'Resources',
  LEARNER_FEEDBACK: 'Learner Feedback Forms',
  EXIT_REVIEW:      'Exit Review & Programme Evaluation',
  LEARNING_SUPPORT: 'Learning Support Forms',
  TRAINER: 'Trainer',
} as const;
