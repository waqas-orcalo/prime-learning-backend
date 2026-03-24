import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdminSeeder } from './database/seeders/admin.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { LearningActivitiesModule } from './modules/learning-activities/learning-activities.module';
import { VisitModule } from './modules/visit/visit.module';
import { ProgressReviewModule } from './modules/progress-review/progress-review.module';
import { PlanOfActivityModule } from './modules/plan-of-activity/plan-of-activity.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LearningJournalsModule } from './modules/learning-journals/learning-journals.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { FeedbackCommentModule } from './modules/feedback-comment/feedback-comment.module';
import { DeclarationModule } from './modules/declaration/declaration.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { TimesheetModule } from './modules/timesheet/timesheet.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { winstonConfig } from './config/winston.config';
import { mongoConfig } from './config/mongo.config';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ── Database ────────────────────────────────────────────────────────────
    MongooseModule.forRootAsync(mongoConfig),

    // ── Logger ──────────────────────────────────────────────────────────────
    WinstonModule.forRoot(winstonConfig),

    // ── Feature modules ─────────────────────────────────────────────────────
    // NotificationsModule must come first so it registers as @Global() before
    // CoursesModule / TasksModule try to inject NotificationsService
    NotificationsModule,
    AuthModule,
    UsersModule,
    TasksModule,
    LearningActivitiesModule,
    VisitModule,
    ProgressReviewModule,
    PlanOfActivityModule,
    MessagesModule,
    ActivityLogModule,
    DashboardModule,
    CoursesModule,
    LearningJournalsModule,
    EvidenceModule,
    FeedbackCommentModule,
    DeclarationModule,
    CriteriaModule,
    TimesheetModule,
  ],
  providers: [
    // ── Global guard: every route is JWT-protected unless marked @Public() ──
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // ── Global interceptor: auto-writes audit log on non-GET requests ───────
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },

    // ── Global exception filter ──────────────────────────────────────────────
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // ── Seed hardcoded admin on first boot ───────────────────────────────────
    AdminSeeder,
  ],
})
export class AppModule implements NestModule {
  // Apply request-logger middleware to every route
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
