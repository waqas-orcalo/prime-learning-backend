import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * AllExceptionsFilter
 * ────────────────────────────────────────────────────────────────────────────
 * Catches every thrown exception (HTTP and non-HTTP) and returns a consistent
 * JSON error envelope to the client.
 *
 * Inspired by: AAC-BE-DEV-001 › apps/gateway/src/app/shared/filters/exceptions.filter.ts
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    this.logger.error(
      exception?.response?.message ?? exception?.message ?? 'Unknown error',
      exception?.stack,
    );

    const statusCode: number =
      exception?.response?.statusCode ??
      exception?.status ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    const message: string =
      exception?.response?.message ??
      exception?.message ??
      'Something went wrong';

    const responseBody = {
      statusCode,
      message,
      data: null,
      error: exception?.response?.error ?? [
        {
          timestamp: new Date().toISOString(),
          path: httpAdapter.getRequestUrl(ctx.getRequest()),
        },
      ],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
