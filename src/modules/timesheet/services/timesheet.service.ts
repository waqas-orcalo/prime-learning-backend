import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TimesheetEntryRepository } from '../repository/timesheet-entry.repository';
import { CreateTimesheetEntryDto } from '../dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from '../dto/update-timesheet-entry.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class TimesheetService {
  constructor(private readonly repo: TimesheetEntryRepository) {}

  async create(dto: CreateTimesheetEntryDto, currentUser: IAuthUser) {
    const spentById = dto.spentBy ?? currentUser._id;
    const entry = await this.repo.create({
      ...dto,
      learningActivityId: dto.learningActivityId
        ? new Types.ObjectId(dto.learningActivityId)
        : undefined,
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      spentBy: new Types.ObjectId(spentById),
      recordedBy: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(entry, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 50, currentUser: IAuthUser) {
    const { data, total } = await this.repo.paginate({
      filterQuery: { isDeleted: false } as any,
      page,
      limit,
      sortBy: 'dateFrom',
      sortOrder: -1,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findByActivity(activityId: string) {
    const entries = await this.repo.findByActivity(activityId);
    return successResponse(entries);
  }

  async getStats(currentUser: IAuthUser) {
    const stats = await this.repo.getOtjStats(currentUser._id);
    return successResponse(stats);
  }

  async findOne(id: string) {
    return successResponse(await this.repo.findById(id));
  }

  async update(id: string, dto: UpdateTimesheetEntryDto) {
    const updateData: any = { ...dto };
    if (dto.dateFrom) updateData.dateFrom = new Date(dto.dateFrom);
    if (dto.dateTo) updateData.dateTo = new Date(dto.dateTo);
    if (dto.learningActivityId) updateData.learningActivityId = new Types.ObjectId(dto.learningActivityId);
    if (dto.spentBy) updateData.spentBy = new Types.ObjectId(dto.spentBy);

    const updated = await this.repo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: updateData },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.repo.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
