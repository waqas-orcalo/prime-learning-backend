import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../users/repository/user.repository';
import { SignInDto } from '../dto/signin.dto';
import { SignUpDto } from '../dto/signup.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import {
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { ErrorMessages } from '../../../common/constants/error-messages.constant';
import { UserRole, UserStatus } from '../../../common/constants/enums.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

/**
 * AuthService
 * ────────────────────────────────────────────────────────────────────────────
 * signUp  → hash password → save user → sign & return JWT so the
 *           client can skip a separate signin call after registration.
 * signIn  → verify password → sign JWT
 * me      → return current user from request context
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // ── Sign Up ────────────────────────────────────────────────────────────────
  async signUp(dto: SignUpDto) {
    // 1. Duplicate e-mail guard
    const existing = await this.userRepository.findOne(
      { email: dto.email.toLowerCase() },
      undefined,
      { throwIfNotFound: false },
    );
    if (existing) {
      throw new BadRequestException(ErrorMessages.USER.EMAIL_EXISTS);
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Persist user (role defaults to LEARNER when not provided)
    const user = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role ?? UserRole.LEARNER,
      status: UserStatus.ACTIVE,
    } as any);

    // 4. Build JWT payload (same shape as signIn so the frontend can re-use it)
    const payload: Omit<IAuthUser, 'iat' | 'exp'> = {
      _id: String((user as any)._id),
      email: (user as any).email,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      role: (user as any).role,
      status: (user as any).status,
      organizationId: (user as any).organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    // 5. Strip passwordHash from the returned user object
    const { passwordHash: _pw, ...safeUser } = user as any;

    return successResponse(
      { accessToken, user: { ...safeUser, ...payload } },
      ResponseMessage.CREATED,
      201,
    );
  }

  // ── Sign In ────────────────────────────────────────────────────────────────
  async signIn(dto: SignInDto) {
    // Use findByEmailWithPassword so passwordHash (select:false) is included
    const user = await this.userRepository.findByEmailWithPassword(
      dto.email.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }
    if ((user as any).status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(ErrorMessages.AUTH.ACCOUNT_BLOCKED);
    }
    if ((user as any).status === UserStatus.INACTIVE) {
      throw new UnauthorizedException(ErrorMessages.AUTH.ACCOUNT_INACTIVE);
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      (user as any).passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    const payload: Omit<IAuthUser, 'iat' | 'exp'> = {
      _id: String((user as any)._id),
      email: (user as any).email,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      role: (user as any).role,
      status: (user as any).status,
      organizationId: (user as any).organizationId,
    };

    const token = this.jwtService.sign(payload);
    return successResponse({ accessToken: token, user: payload });
  }

  // ── Current User ───────────────────────────────────────────────────────────
  async me(currentUser: IAuthUser) {
    const user = await this.userRepository.findById(currentUser._id);
    const { passwordHash: _pw, ...safeUser } = user as any;
    return successResponse(safeUser);
  }

  // ── Change Password ────────────────────────────────────────────────────────
  async changePassword(currentUser: IAuthUser, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const user = await this.userRepository.findById(currentUser._id);
    const match = await bcrypt.compare(
      dto.currentPassword,
      (user as any).passwordHash,
    );
    if (!match) {
      throw new BadRequestException(ErrorMessages.AUTH.SAME_PASSWORD);
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.findOneAndUpdate(
      { _id: (user as any)._id },
      { passwordHash: newHash },
    );

    return successResponse(null, ResponseMessage.PASSWORD_CHANGED);
  }
}
