import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LoggerMiddleware
 * ────────────────────────────────────────────────────────────────────────────
 * Logs every incoming HTTP request once the response finishes:
 *   METHOD /path STATUS bytes - user-agent IP
 *
 * Applied to all routes in AppModule.configure().
 *
 * Inspired by: AAC-BE-DEV-001 › apps/gateway/src/app/middleware/logger.middleware.ts
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') ?? '';

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') ?? 0;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
