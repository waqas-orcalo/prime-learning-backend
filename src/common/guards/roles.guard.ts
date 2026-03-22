import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../constants/enums.constant';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ErrorMessages } from '../constants/error-messages.constant';
import { IAuthUser } from '../interfaces/auth-user.interface';

/**
 * RolesGuard
 * ────────────────────────────────────────────────────────────────────────────
 * Applied per-controller or per-route alongside @Roles().
 * Reads roles metadata set by @Roles() and compares with request.user.role.
 *
 * Usage (controller-level):
 *   @UseGuards(RolesGuard)
 *   @Roles(UserRole.ORG_ADMIN)
 *   @Controller(CONTROLLERS.USERS)
 *   export class UsersController { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() set → everyone with a valid JWT can access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: IAuthUser }>();

    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException(ErrorMessages.GENERIC.FORBIDDEN);
    }

    return true;
  }
}
