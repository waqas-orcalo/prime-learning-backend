import { UserRole, UserStatus } from '../constants/enums.constant';

/**
 * IAuthUser
 * ────────────────────────────────────────────────────────────────────────────
 * Shape of the authenticated user attached to every request by JwtAuthGuard.
 * Use @CurrentUser() decorator to access it in controllers.
 */
export interface IAuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  iat?: number;
  exp?: number;
}
