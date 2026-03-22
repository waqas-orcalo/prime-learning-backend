import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * TransformResponseInterceptor
 * ────────────────────────────────────────────────────────────────────────────
 * Wraps every controller return value in the standard API envelope:
 *   { statusCode, message, data, pagination, error }
 *
 * Apply per-controller or globally in AppModule via APP_INTERCEPTOR.
 *
 * Controllers that already return a shaped object (via successResponse())
 * are left untouched because they already have a `statusCode` field.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Already shaped by successResponse() helper → pass through
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        return {
          statusCode: 200,
          message: 'Success',
          data: data ?? null,
          pagination: null,
          error: null,
        };
      }),
    );
  }
}
