import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';
import { ErrorMessages } from '../constants/error-messages.constant';

/**
 * JwtAuthGuard
 * ────────────────────────────────────────────────────────────────────────────
 * Global guard — applied via APP_GUARD in AppModule so every route is
 * protected by default. Routes decorated with @Public() are bypassed.
 *
 * Inspired by: AAC-BE-DEV-001 › apps/gateway/src/app/shared/guards/auth.guard.ts
 *
 * Flow:
 *  1. Check if route is marked @Public() → allow immediately.
 *  2. Delegate JWT extraction & verification to Passport JwtStrategy.
 *  3. Attach verified user payload to request.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(err: Error, user: any) {
    if (err || !user) {
      throw err ?? new UnauthorizedException(ErrorMessages.AUTH.TOKEN_MISSING);
    }
    return user;
  }
}
