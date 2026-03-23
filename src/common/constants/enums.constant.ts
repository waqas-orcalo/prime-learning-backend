/**
 * ENUMS
 * ────────────────────────────────────────────────────────────────────────────
 * All application-wide TypeScript enums in one place.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/constants/enums.ts
 */

// ── User ─────────────────────────────────────────────────────────────────────
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  TRAINER = 'TRAINER',
  LEARNER = 'LEARNER',
  IQA = 'IQA',
  EMPLOYER = 'EMPLOYER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

// ── Task ─────────────────────────────────────────────────────────────────────
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ── Learning Activities ───────────────────────────────────────────────────────
export enum ActivityMethod {
  ONLINE_COURSE = 'ONLINE_COURSE',
  CLASSROOM_DELIVERY = 'CLASSROOM_DELIVERY',
  WORKSHOP = 'WORKSHOP',
  SELF_DIRECTED_STUDY = 'SELF_DIRECTED_STUDY',
  COMPETITION = 'COMPETITION',
  ASSIGNMENT = 'ASSIGNMENT',
  OBSERVATION = 'OBSERVATION',
  MENTORING = 'MENTORING',
  E_LEARNING = 'E_LEARNING',
}

export enum ActivityType {
  ON_THE_JOB = 'ON_THE_JOB',
  OFF_THE_JOB = 'OFF_THE_JOB',
}

// ── Visit ─────────────────────────────────────────────────────────────────────
export enum VisitType {
  OBSERVATION = 'OBSERVATION',
  PROGRESS_REVIEW = 'PROGRESS_REVIEW',
  EMPLOYER_VISIT = 'EMPLOYER_VISIT',
  INITIAL_ASSESSMENT = 'INITIAL_ASSESSMENT',
  EPA_READINESS = 'EPA_READINESS',
  REMOTE_VISIT = 'REMOTE_VISIT',
}

export enum TransportMode {
  CAR = 'CAR',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  WALKING = 'WALKING',
  CYCLING = 'CYCLING',
  REMOTE = 'REMOTE',
}

// ── Programme / Schedule ──────────────────────────────────────────────────────
export enum SessionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// ── Signature ─────────────────────────────────────────────────────────────────
export enum SignatureRole {
  LEARNER = 'LEARNER',
  TRAINER = 'TRAINER',
  EMPLOYER = 'EMPLOYER',
  IQA = 'IQA',
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export enum ActivityLogAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  SIGN = 'SIGN',
  VIEW = 'VIEW',
}

export enum ActivityLogModule {
  AUTH = 'AUTH',
  USERS = 'USERS',
  TASKS = 'TASKS',
  LEARNING_ACTIVITIES = 'LEARNING_ACTIVITIES',
  TIMESHEET = 'TIMESHEET',
  EVIDENCE = 'EVIDENCE',
  VISIT = 'VISIT',
  PROGRESS_REVIEW = 'PROGRESS_REVIEW',
  PLAN_OF_ACTIVITY = 'PLAN_OF_ACTIVITY',
  MESSAGES = 'MESSAGES',
}

// ── Learning Journal ──────────────────────────────────────────────────────────
export enum JournalPrivacy {
  ONLY_ME = 'only_me',
  EVERYONE = 'everyone',
}

// ── Time Span Filters ────────────────────────────────────────────────────────
export enum ETimeSpan {
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  CUSTOM_DATE = 'CUSTOM_DATE',
}

// ── Course ────────────────────────────────────────────────────────────────
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ── Learning Activity Additional ──────────────────────────────────────────────
export enum ActionRequiredBy {
  LEARNER = 'LEARNER',
  TRAINER = 'TRAINER',
  BOTH = 'BOTH',
}

export enum EvidenceRecording {
  HOLISTIC = 'HOLISTIC',
  SEPARATE = 'SEPARATE',
  BOTH = 'BOTH',
}

// ── Timesheet ─────────────────────────────────────────────────────────────────
export enum TimesheetCategory {
  CLASSROOM_DELIVERY = 'CLASSROOM_DELIVERY',
  COMPETITION = 'COMPETITION',
  LEARNING_ACTIVITY = 'LEARNING_ACTIVITY',
  WORKSHOP = 'WORKSHOP',
  E_LEARNING = 'E_LEARNING',
  OBSERVATION = 'OBSERVATION',
  MENTORING = 'MENTORING',
  SELF_DIRECTED_STUDY = 'SELF_DIRECTED_STUDY',
  ONLINE_COURSE = 'ONLINE_COURSE',
}

// ── Feedback / Comment ────────────────────────────────────────────────────────
export enum FeedbackCommentType {
  FEEDBACK = 'FEEDBACK',
  COMMENT = 'COMMENT',
}

// ── Criteria ──────────────────────────────────────────────────────────────────
export enum CriteriaType {
  KNOWLEDGE = 'KNOWLEDGE',
  SKILL = 'SKILL',
  BEHAVIOUR = 'BEHAVIOUR',
}
