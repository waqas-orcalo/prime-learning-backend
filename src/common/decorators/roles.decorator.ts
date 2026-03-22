import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/enums.constant';

/**
 * @Roles(...roles)
 * ────────────────────────────────────────────────────────────────────────────
 * Restrict a route to specific user roles.
 * Enforced by RolesGuard (applied per-controller or per-route).
 *
 * Usage:
 *   @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
 *   @Delete(API_ENDPOINTS.TASKS.DELETE)
 *   deleteTask(@Param('id') id: string) { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
