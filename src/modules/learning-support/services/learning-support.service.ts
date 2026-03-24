import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LearningSupportRepository } from '../repository/learning-support.repository';
import { CreateLearningSupportDto } from '../dto/create-learning-support.dto';
import { UpdateLearningSupportDto } from '../dto/update-learning-support.dto';
import { ListLearningSupportDto } from '../dto/list-learning-support.dto';
import { SignLearningSupportDto } from '../dto/sign-learning-support.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class LearningSupportService {
  constructor(private readonly repo: LearningSupportRepository) {}

  // ── Helpers ───────────────────────────────────────────────────────────────────
  private buildInstanceName(learnerName: string, date: Date): string {
    const d = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${learnerName} - Learning Support Form - ${d}`;
  }

  // ── Create ────────────────────────────────────────────────────────────────────
  async create(dto: CreateLearningSupportDto, currentUser: IAuthUser) {
    const formName = '5.Learning Support Form';

    const instanceName = this.buildInstanceName(
      `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || 'Learner',
      new Date(),
    );

    const doc = await this.repo.create({
      formName,
      instanceName,
      learnerId:          new Types.ObjectId(dto.learnerId),
      trainerId:          dto.trainerId ? new Types.ObjectId(dto.trainerId) : null,
      attachmentUrl:      dto.attachmentUrl      ?? '',
      attachmentName:     dto.attachmentName     ?? '',
      monthlyReview:      dto.monthlyReview      ?? 'No/False',
      threeMonthlyReview: dto.threeMonthlyReview ?? 'No/False',
      changesNotes:       dto.changesNotes        ?? '',
      activityTracker:    dto.activityTracker    ?? '',
      reasonForStopping:  dto.reasonForStopping  ?? '',
      tutorConfirmationA: dto.tutorConfirmationA ?? 'No/False',
      tutorConfirmationB: dto.tutorConfirmationB ?? 'No/False',
      learnerConfirmation: dto.learnerConfirmation ?? 'No/False',
      learnerSigned:      dto.learnerSigned      ?? false,
      trainerSigned:      dto.trainerSigned      ?? false,
    } as any);

    return successResponse(doc, ResponseMessage.CREATED, 201);
  }

  // ── List ──────────────────────────────────────────────────────────────────────
  async findAll(dto: ListLearningSupportDto, currentUser: IAuthUser) {
    const page  = Math.max(1, parseInt(String(dto.page  ?? 1),  10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(dto.limit ?? 20), 10) || 20));

    const options: Parameters<typeof this.repo.findAllPaginated>[2] = {
      learnerId: dto.learnerId,
      trainerId: dto.trainerId,
      dateFrom:  dto.dateFrom,
      dateTo:    dto.dateTo,
    };

    if (currentUser.role === UserRole.LEARNER) {
      options.learnerId = currentUser._id;
    }

    const { data, total } = await this.repo.findAllPaginated(page, limit, options);

    const shaped = data.map((f: any) => ({
      ...f,
      learnerName:  f.learner
        ? `${f.learner.firstName} ${f.learner.lastName}`.trim()
        : '',
      dateCreated:  this.formatDT(f.createdAt),
      dateModified: this.formatDT(f.updatedAt),
      signed:       f.learnerSigned && f.trainerSigned,
    }));

    return paginatedResponse(shaped, total, page, limit);
  }

  // ── Get one ───────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const doc = await this.repo.findByIdPopulated(id);
    if (!doc || (doc as any).isDeleted) throw new NotFoundException('Learning support form not found.');
    return successResponse(doc);
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateLearningSupportDto, currentUser: IAuthUser) {
    const existing = await this.repo.findById(id);
    this.assertCanEdit(existing as any, currentUser);

    const updated = await this.repo.findOneAndUpdate({ _id: id }, { $set: dto });
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  // ── Soft-delete ───────────────────────────────────────────────────────────────
  async remove(id: string, currentUser: IAuthUser) {
    const existing = await this.repo.findById(id);
    this.assertCanEdit(existing as any, currentUser);

    await this.repo.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } });
    return successResponse(null, ResponseMessage.DELETED);
  }

  // ── Sign ──────────────────────────────────────────────────────────────────────
  async sign(id: string, dto: SignLearningSupportDto, _currentUser: IAuthUser) {
    const now = new Date();
    const update: Record<string, any> =
      dto.role === 'learner'
        ? { learnerSigned: true, learnerSignedAt: now }
        : { trainerSigned: true, trainerSignedAt: now };

    const updated = await this.repo.findOneAndUpdate({ _id: id }, { $set: update });
    return successResponse(
      updated,
      `${dto.role === 'learner' ? 'Learner' : 'Trainer'} signature recorded`,
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────────
  private assertCanEdit(doc: any, user: IAuthUser) {
    const isAdmin   = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN].includes(user.role as any);
    const isTrainer = user.role === UserRole.TRAINER;
    const isOwner   = doc?.learnerId?.toString() === user._id;
    if (!isAdmin && !isTrainer && !isOwner) {
      throw new ForbiddenException('You do not have permission to modify this form.');
    }
  }

  private formatDT(d: any): string {
    if (!d) return '';
    const date  = new Date(d);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yr    = String(date.getFullYear()).slice(-2);
    const hh    = String(date.getHours()).padStart(2, '0');
    const mm    = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${yr} ${hh}:${mm}`;
  }
}
