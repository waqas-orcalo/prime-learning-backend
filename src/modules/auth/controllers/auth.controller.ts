import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { Public } from '../../../common/decorators/auth.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { AuthService } from '../services/auth.service';
import { SignInDto } from '../dto/signin.dto';
import { SignUpDto } from '../dto/signup.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

/**
 * AuthController
 * ────────────────────────────────────────────────────────────────────────────
 * Demonstrates all key patterns from AAC-BE-DEV-001:
 *  - CONTROLLERS constant for route prefix (no hard-coded strings)
 *  - API_ENDPOINTS constants for each method path
 *  - API_TAGS for Swagger grouping
 *  - @Public() decorator to bypass JwtAuthGuard
 *  - @CurrentUser() to read the authenticated user
 *  - @ApiBearerAuth() on protected routes
 */
@ApiTags(API_TAGS.AUTH)
@Controller(CONTROLLERS.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Public routes ─────────────────────────────────────────────────────────

  @Public()
  @Post(API_ENDPOINTS.AUTH.SIGNUP)
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({ description: 'Account created' })
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post(API_ENDPOINTS.AUTH.SIGNIN)
  @ApiOperation({ summary: 'Sign in and receive a JWT' })
  @ApiOkResponse({ description: 'Access token returned' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  // ── Protected routes ──────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.AUTH.ME)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  me(@CurrentUser() user: IAuthUser) {
    return this.authService.me(user);
  }

  @Patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @CurrentUser() user: IAuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }
}
