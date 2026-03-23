import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LearningJournalRepository } from '../repository/learning-journal.repository';
import { CreateLearningJournalDto } from '../dto/create-learning-journal.dto';
import { UpdateLearningJournalDto } from '../dto/update-learning-journal.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class LearningJournalsService {
  constructor(
    private readonly journalRepository: LearningJournalRepository,
  ) {}

  async create(dto: CreateLearningJournalDto, currentUser: IAuthUser) {
    const journal = await this.journalRepository.create({
      ...dto,
      createdBy: new Types.ObjectId(currentUser._id),
      ...(dto.learningActivityId
        ? { learningActivityId: new Types.ObjectId(dto.learningActivityId) }
        : {}),
    } as any);
    return successResponse(journal, ResponseMessage.CREATED, 201);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    privacy: string,
    currentUser: IAuthUser,
  ) {
    // Guard against NaN when implicit conversion turns undefined → NaN
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 10);

    const baseFilter: Record<string, any> = { isDeleted: false };

    // Learners only see their own journals; trainers/admins see all
    if (currentUser.role === UserRole.LEARNER) {
      baseFilter.createdBy = new Types.ObjectId(currentUser._id);
    }

    if (privacy) {
      baseFilter.privacy = privacy;
    }

    let filterQuery = baseFilter;

    if (search) {
      const regex = new RegExp(search, 'i');
      filterQuery = {
        ...baseFilter,
        $or: [{ title: regex }, { category: regex }, { reflection: regex }],
      };
    }

    const { data, total, pages } = await this.journalRepository.paginate({
      filterQuery: filterQuery as any,
      page: p,
      limit: l,
      sortBy: 'createdAt',
      sortOrder: -1,
    });

    return paginatedResponse(data, total, p, l);
  }

  async findOne(id: string) {
    const journal = await this.journalRepository.findById(id);
    return successResponse(journal);
  }

  async update(
    id: string,
    dto: UpdateLearningJournalDto,
    currentUser: IAuthUser,
  ) {
    const journal = await this.journalRepository.findById(id);

    if (
      currentUser.role === UserRole.LEARNER &&
      String((journal as any).createdBy) !== currentUser._id
    ) {
      throw new ForbiddenException(
        'You can only update your own journal entries.',
      );
    }

    const updated = await this.journalRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async findByActivity(activityId: string) {
    const journals = await this.journalRepository.findByActivity(activityId);
    return successResponse(journals);
  }

  async remove(id: string, currentUser: IAuthUser) {
    const journal = await this.journalRepository.findById(id);

    if (
      currentUser.role === UserRole.LEARNER &&
      String((journal as any).createdBy) !== currentUser._id
    ) {
      throw new ForbiddenException(
        'You can only delete your own journal entries.',
      );
    }

    await this.journalRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
