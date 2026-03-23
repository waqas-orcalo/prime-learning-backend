import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TaskRepository } from '../repository/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { TaskStatus, UserRole } from '../../../common/constants/enums.constant';
import { TaskPriority } from '../../../common/constants/enums.constant';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create(dto: CreateTaskDto, currentUser: IAuthUser) {
    const task = await this.taskRepository.create({
      ...dto,
      createdBy: new Types.ObjectId(currentUser._id),
      assignedTo: dto.assignedTo
        ? new Types.ObjectId(dto.assignedTo)
        : null,
    } as any);
    return successResponse(task, ResponseMessage.CREATED, 201);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    currentUser: IAuthUser,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    // Admins/trainers see all tasks; learners see only tasks assigned to them
    const filterQuery =
      currentUser.role === UserRole.LEARNER
        ? { assignedTo: new Types.ObjectId(currentUser._id), isDeleted: false }
        : { isDeleted: false };

    const { data, total, pages } = await this.taskRepository.paginate({
      filterQuery: filterQuery as any,
      page: p,
      limit: l,
    });
    return paginatedResponse(data, total, p, l);
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findById(id);
    return successResponse(task);
  }

  async update(id: string, dto: UpdateTaskDto, currentUser: IAuthUser) {
    const task = await this.taskRepository.findById(id);

    // Learners can only update their own tasks
    if (
      currentUser.role === UserRole.LEARNER &&
      String((task as any).createdBy) !== currentUser._id
    ) {
      throw new ForbiddenException('You can only update your own tasks.');
    }

    const updated = await this.taskRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async updateStatus(id: string, status: TaskStatus, currentUser: IAuthUser) {
    const updated = await this.taskRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: { status } },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.taskRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }

  async getStats(currentUser: IAuthUser) {
    const stats = await this.taskRepository.countByStatus();
    return successResponse(stats);
  }

  async assign(id: string, dto: AssignTaskDto) {
    const original = await this.taskRepository.findById(id);
    const results = [];
    for (const userId of dto.userIds) {
      const task = await this.taskRepository.create({
        title: (original as any).title,
        description: (original as any).description,
        priority: (original as any).priority,
        dueDate: (original as any).dueDate,
        status: TaskStatus.PENDING,
        assignedTo: new Types.ObjectId(userId),
        createdBy: (original as any).createdBy,
      } as any);
      results.push(task);
    }
    return successResponse(results, 'Tasks assigned successfully', 201);
  }
}
