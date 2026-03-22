import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { User } from '../schemas/user.schema';

/**
 * UserRepository
 * ────────────────────────────────────────────────────────────────────────────
 * Domain repository for User documents.
 *
 * Pattern (from AAC-BE-DEV-001):
 *  1. Extend AbstractRepository<User>
 *  2. Inject the Mongoose model with @InjectModel
 *  3. Inject Connection for transaction support
 *  4. Add any user-specific queries below the constructor
 *
 * Services inject UserRepository — never the Mongoose Model directly.
 */
@Injectable()
export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  // ── Domain-specific queries ────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() }, undefined, {
      throwIfNotFound: false,
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    // password is select:false — use explicit projection to include it
    return this.model
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .lean()
      .exec() as unknown as User | null;
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    role?: string,
  ) {
    const filterQuery: Record<string, any> = {};
    if (search) {
      filterQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filterQuery.role = role;

    return this.paginate({ filterQuery, page, limit });
  }
}
