import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { ErrorMessages } from '../../../common/constants/error-messages.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole, UserStatus } from '../../../common/constants/enums.constant';

/**
 * UsersService
 * ────────────────────────────────────────────────────────────────────────────
 * All business logic lives here — controllers are thin and call service methods.
 * Uses UserRepository for all data access (repository pattern).
 */
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(dto: ListUsersDto) {
    const { search, role } = dto;
    const page  = Math.max(1, parseInt(String(dto.page  ?? 1),  10) || 1);
    const limit = Math.max(1, parseInt(String(dto.limit ?? 10), 10) || 10);
    const { data, total } = await this.userRepository.findAllPaginated(
      page,
      limit,
      search,
      role,
    );
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    const { passwordHash: _pw, ...safeUser } = user as any;
    return successResponse(safeUser);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: IAuthUser) {
    const updated = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $set: dto },
    );
    const { passwordHash: _pw, ...safe } = updated as any;
    return successResponse(safe, ResponseMessage.UPDATED);
  }

  async remove(id: string, currentUser: IAuthUser) {
    if (String(currentUser._id) === id) {
      throw new NotFoundException(ErrorMessages.USER.CANNOT_DELETE_SELF);
    }
    await this.userRepository.deleteOne({ _id: id } as any);
    return successResponse(null, ResponseMessage.DELETED);
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role ?? UserRole.LEARNER,
      status: UserStatus.ACTIVE,
      phone: dto.phone ?? null,
    } as any);
    const { passwordHash: _pw, ...safe } = user as any;
    return successResponse(safe, ResponseMessage.CREATED, 201);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const updated = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $set: { status: dto.status } },
    );
    const { passwordHash: _pw, ...safe } = updated as any;
    return successResponse(safe, ResponseMessage.UPDATED);
  }

  /** Find a user by exact email (for admin task-assignment lookup) */
  async findOneByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    const { passwordHash: _pw, ...safe } = user as any;
    return successResponse(safe);
  }

  /** Admin-only: set a user's password directly (no old password required) */
  async adminResetPassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updated = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $set: { passwordHash } },
    );
    const { passwordHash: _pw, ...safe } = updated as any;
    return successResponse(safe, 'Password reset successfully');
  }
}
