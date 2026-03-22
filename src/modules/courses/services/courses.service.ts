import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseRepository } from '../repository/course.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { EnrollUsersDto } from '../dto/enroll-users.dto';
import { ListCoursesDto } from '../dto/list-courses.dto';
import { paginatedResponse, ResponseMessage, successResponse } from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async create(dto: CreateCourseDto, currentUser: IAuthUser) {
    const course = await this.courseRepository.create({ ...dto, createdBy: new Types.ObjectId(currentUser._id) } as any);
    return successResponse(course, ResponseMessage.CREATED, 201);
  }

  async findAll(dto: ListCoursesDto) {
    const { search, status } = dto;
    const page  = Math.max(1, parseInt(String(dto.page  ?? 1),  10) || 1);
    const limit = Math.max(1, parseInt(String(dto.limit ?? 10), 10) || 10);
    const { data, total } = await this.courseRepository.findAllPaginated(page, limit, search, status);
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findById(id);
    return successResponse(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const updated = await this.courseRepository.findOneAndUpdate({ _id: id }, { $set: dto });
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
    return successResponse(updated, 'Users enrolled successfully');
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
}
