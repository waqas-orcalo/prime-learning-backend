import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS, UserRole } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { EnrollUsersDto } from '../dto/enroll-users.dto';
import { ListCoursesDto } from '../dto/list-courses.dto';

@ApiTags(API_TAGS.COURSES)
@ApiBearerAuth()
@Controller(CONTROLLERS.COURSES)
@UseGuards(RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Create a course' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: IAuthUser) {
    return this.coursesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses' })
  findAll(@Query() dto: ListCoursesDto) {
    return this.coursesService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/enroll')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Enroll users in a course' })
  enroll(@Param('id') id: string, @Body() dto: EnrollUsersDto) {
    return this.coursesService.enroll(id, dto);
  }

  @Delete(':id/enroll/:userId')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Unenroll a user from a course' })
  unenroll(@Param('id') id: string, @Param('userId') userId: string) {
    return this.coursesService.unenroll(id, userId);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get course enrollments' })
  getEnrollments(@Param('id') id: string) {
    return this.coursesService.getEnrollments(id);
  }

  @Get(':id/my-progress')
  @ApiOperation({ summary: 'Get current user progress for a course' })
  getMyProgress(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.coursesService.getMyProgress(id, user);
  }

  @Post(':id/complete-slide')
  @ApiOperation({ summary: 'Mark a slide as completed' })
  completeSlide(
    @Param('id') id: string,
    @Body() body: { slideKey: string },
    @CurrentUser() user: IAuthUser,
  ) {
    return this.coursesService.completeSlide(id, body.slideKey, user);
  }
}
