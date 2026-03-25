import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseRepository } from '../repository/course.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { EnrollUsersDto } from '../dto/enroll-users.dto';
import { EnrollGroupDto } from '../dto/enroll-group.dto';
import { ListCoursesDto } from '../dto/list-courses.dto';
import { paginatedResponse, ResponseMessage, successResponse } from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';
import { CourseProgress } from '../schemas/course-progress.schema';
import { GroupRepository } from '../../groups/repository/group.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly groupRepository: GroupRepository,
    @Optional() private readonly notificationsService: NotificationsService,
    @InjectModel(CourseProgress.name) private readonly progressModel: Model<CourseProgress>,
  ) {}

  async create(dto: CreateCourseDto, currentUser: IAuthUser) {
    const payload: any = { ...dto, createdBy: new Types.ObjectId(currentUser._id) };
    // Auto-calculate modules count from courseModules if provided
    if (dto.courseModules) payload.modules = dto.courseModules.length;
    const course = await this.courseRepository.create(payload);
    return successResponse(course, ResponseMessage.CREATED, 201);
  }

  async findAll(dto: ListCoursesDto) {
    const { search, status, enrolledUserId } = dto;
    const page  = Math.max(1, parseInt(String(dto.page  ?? 1),  10) || 1);
    const limit = Math.max(1, parseInt(String(dto.limit ?? 10), 10) || 10);
    const { data, total } = await this.courseRepository.findAllPaginated(page, limit, search, status, enrolledUserId);
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findById(id);
    return successResponse(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const payload: any = { ...dto };
    if (dto.courseModules) payload.modules = dto.courseModules.length;
    const updated = await this.courseRepository.findOneAndUpdate({ _id: id }, { $set: payload });
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.courseRepository.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } });
    return successResponse(null, ResponseMessage.DELETED);
  }

  async enroll(id: string, dto: EnrollUsersDto) {
    const userObjectIds = dto.userIds.map(uid => new Types.ObjectId(uid));
    const updated = await this.courseRepository.findOneAndUpdate(
      { _id: id },
      { $addToSet: { enrolledUsers: { $each: userObjectIds } } },
    );
    if (this.notificationsService) {
      for (const userId of dto.userIds) {
        this.notificationsService.createOne(
          userId,
          NotificationType.COURSE_ENROLLED,
          'New Course Assigned',
          `You have been enrolled in a new course: "${(updated as any).title}"`,
        ).catch(() => {});
      }
    }
    return successResponse(updated, 'Users enrolled successfully');
  }

  async enrollGroup(courseId: string, dto: EnrollGroupDto) {
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group || (group as any).isDeleted) throw new NotFoundException('Group not found');

    const memberIds = ((group as any).members as any[]).map((m: any) =>
      typeof m === 'object' && m._id ? String(m._id) : String(m),
    );

    if (memberIds.length === 0) {
      return successResponse(null, 'Group has no members to enroll');
    }

    const memberObjectIds = memberIds.map(id => new Types.ObjectId(id));
    const updated = await this.courseRepository.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { enrolledUsers: { $each: memberObjectIds } } },
    );

    if (this.notificationsService) {
      for (const userId of memberIds) {
        this.notificationsService.createOne(
          userId,
          NotificationType.COURSE_ENROLLED,
          'New Course Assigned',
          `You have been enrolled in a new course: "${(updated as any).title}"`,
        ).catch(() => {});
      }
    }

    return successResponse(
      { enrolledCount: memberIds.length, groupName: (group as any).name },
      `${memberIds.length} group member(s) enrolled successfully`,
    );
  }

  async unenroll(courseId: string, userId: string) {
    const updated = await this.courseRepository.findOneAndUpdate(
      { _id: courseId },
      { $pull: { enrolledUsers: new Types.ObjectId(userId) } },
    );
    return successResponse(updated, 'User unenrolled successfully');
  }

  async getEnrollments(id: string) {
    const course = await this.courseRepository.findByIdWithEnrollments(id);
    return successResponse((course as any)?.enrolledUsers ?? []);
  }

  /** Get progress for the current user on a specific course */
  async getMyProgress(courseId: string, currentUser: IAuthUser) {
    const course = await this.courseRepository.findById(courseId);
    const totalSlides = ((course as any).courseModules ?? [])
      .reduce((sum: number, m: any) => sum + (m.slides?.length ?? 0), 0);

    let progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(currentUser._id),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    const completedSlideKeys: string[] = (progress as any)?.completedSlideKeys ?? [];
    const completedCount = completedSlideKeys.length;
    const percentage = totalSlides > 0 ? Math.round((completedCount / totalSlides) * 100) : 0;

    return successResponse({ completedSlideKeys, completedCount, totalSlides, percentage });
  }

  /** Mark a slide as completed for the current user */
  async completeSlide(courseId: string, slideKey: string, currentUser: IAuthUser) {
    await this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(currentUser._id), courseId: new Types.ObjectId(courseId) },
      { $addToSet: { completedSlideKeys: slideKey } },
      { upsert: true, new: true },
    );

    const course = await this.courseRepository.findById(courseId);
    const totalSlides = ((course as any).courseModules ?? [])
      .reduce((sum: number, m: any) => sum + (m.slides?.length ?? 0), 0);

    const updated = await this.progressModel.findOne({
      userId: new Types.ObjectId(currentUser._id),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    const completedSlideKeys: string[] = (updated as any)?.completedSlideKeys ?? [];
    const percentage = totalSlides > 0 ? Math.round((completedSlideKeys.length / totalSlides) * 100) : 0;

    return successResponse({ completedSlideKeys, completedCount: completedSlideKeys.length, totalSlides, percentage });
  }
}
