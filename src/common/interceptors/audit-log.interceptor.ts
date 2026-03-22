import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { ActivityLogAction, ActivityLogModule } from '../constants/enums.constant';
import { ActivityLogService } from '../../modules/activity-log/services/activity-log.service';

/**
 * AuditLogInterceptor
 * ────────────────────────────────────────────────────────────────────────────
 * Applied globally via APP_INTERCEPTOR in AppModule.
 * After every successful non-GET request it records who did what and when,
 * persisting entries to MongoDB via ActivityLogService.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    @Optional() @Inject(ActivityLogService)
    private readonly activityLogService: ActivityLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;

    return next.handle().pipe(
      tap((responseBody) => {
        // Only log mutating requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          const user: IAuthUser | undefined = request.user;
          if (!user?._id) return; // skip unauthenticated requests

          const action = this.resolveAction(method);
          const module = this.resolveModule(url);
          const resourceId = responseBody?.data?._id?.toString() ?? undefined;
          const description = `${method.toUpperCase()} ${url}`;

          this.logger.log(`[AUDIT] ${user._id} → ${description}`);

          if (this.activityLogService) {
            this.activityLogService.log({
              performedBy: user._id,
              action,
              module,
              resourceId,
              description,
              ipAddress: (ip ?? headers?.['x-forwarded-for'] ?? '').toString(),
              userAgent: headers?.['user-agent'] ?? '',
            }).catch((err) => this.logger.error('[AUDIT] Failed to persist log', err));
          }
        }
      }),
    );
  }

  private resolveAction(method: string): ActivityLogAction {
    const map: Record<string, ActivityLogAction> = {
      POST: ActivityLogAction.CREATE,
      PUT: ActivityLogAction.UPDATE,
      PATCH: ActivityLogAction.UPDATE,
      DELETE: ActivityLogAction.DELETE,
    };
    return map[method.toUpperCase()] ?? ActivityLogAction.VIEW;
  }

  private resolveModule(url: string): ActivityLogModule {
    if (url.includes('auth')) return ActivityLogModule.AUTH;
    if (url.includes('users')) return ActivityLogModule.USERS;
    if (url.includes('tasks')) return ActivityLogModule.TASKS;
    if (url.includes('timesheet')) return ActivityLogModule.TIMESHEET;
    if (url.includes('evidence')) return ActivityLogModule.EVIDENCE;
    if (url.includes('visit')) return ActivityLogModule.VISIT;
    if (url.includes('progress-review')) return ActivityLogModule.PROGRESS_REVIEW;
    if (url.includes('plan-of-activity')) return ActivityLogModule.PLAN_OF_ACTIVITY;
    if (url.includes('learning-activities')) return ActivityLogModule.LEARNING_ACTIVITIES;
    if (url.includes('messages')) return ActivityLogModule.MESSAGES;
    return ActivityLogModule.USERS;
  }
}
