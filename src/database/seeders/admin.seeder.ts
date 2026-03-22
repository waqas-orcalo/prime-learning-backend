import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../modules/users/repository/user.repository';
import { UserRole, UserStatus } from '../../common/constants/enums.constant';

/**
 * AdminSeeder
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs once when the application boots.  Creates the hardcoded Super-Admin
 * account if no user with that e-mail already exists.
 *
 * Credentials (change these in production via env vars):
 *   Email    → ADMIN_EMAIL   (default: admin@prime.com)
 *   Password → ADMIN_PASSWORD (default: Admin@123)
 */
@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(private readonly userRepository: UserRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    const email =
      process.env.ADMIN_EMAIL?.toLowerCase() ?? 'admin@prime.com';

    // Check if the admin user already exists
    const existing = await this.userRepository.findOne(
      { email },
      undefined,
      { throwIfNotFound: false },
    );

    if (existing) {
      this.logger.log(`Admin user already exists: ${email}`);
      return;
    }

    const rawPassword =
      process.env.ADMIN_PASSWORD ?? 'Admin@123';

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    await this.userRepository.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    } as any);

    this.logger.log(`✅  Admin user seeded → ${email} / ${rawPassword}`);
  }
}
