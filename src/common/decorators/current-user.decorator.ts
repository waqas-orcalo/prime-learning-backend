import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthUser } from '../interfaces/auth-user.interface';

/**
 * @CurrentUser()
 * ────────────────────────────────────────────────────────────────────────────
 * Extracts the authenticated user from the request object.
 * Populated by JwtAuthGuard after token verification.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: IAuthUser) { ... }
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/custom/transform-user.decorator.ts
 */
export const CurrentUser = createParamDecorator(
  (_data: keyof IAuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IAuthUser = request.user;
    return _data ? user?.[_data] : user;
  },
);
