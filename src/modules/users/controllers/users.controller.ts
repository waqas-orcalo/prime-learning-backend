import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  API_ENDPOINTS,
  API_TAGS,
  CONTROLLERS,
  UserRole,
} from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { UpdatePresenceDto } from '../dto/update-presence.dto';

@ApiTags(API_TAGS.USERS)
@ApiBearerAuth()
@Controller(CONTROLLERS.USERS)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── /me routes MUST come before /:id to avoid NestJS route conflicts ────
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user\'s profile' })
  getMe(@CurrentUser() user: IAuthUser) {
    return this.usersService.getMe(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the currently authenticated user\'s profile' })
  updateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: IAuthUser) {
    return this.usersService.updateMe(dto, user);
  }

  @Patch('me/presence')
  @ApiOperation({ summary: 'Update the currently authenticated user\'s presence/status' })
  updatePresence(@Body() dto: UpdatePresenceDto, @CurrentUser() user: IAuthUser) {
    return this.usersService.updatePresence(dto, user);
  }

  // ── Static-segment routes before /:id ────────────────────────────────────
  @Get('by-email/:email')
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Find user by exact email (trainer/admin only)' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get(API_ENDPOINTS.USERS.GET_ALL)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all users (trainer/admin)' })
  findAll(@Query() dto: ListUsersDto) {
    return this.usersService.findAll(dto);
  }

  @Get(API_ENDPOINTS.USERS.GET_ONE)
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(API_ENDPOINTS.USERS.UPDATE)
  @ApiOperation({ summary: 'Update a user by ID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(API_ENDPOINTS.USERS.DELETE)
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.usersService.remove(id, user);
  }

  @Post(API_ENDPOINTS.USERS.CREATE)
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user status (admin only)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: reset any user password (super admin only)' })
  adminResetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.usersService.adminResetPassword(id, body.newPassword);
  }
}
