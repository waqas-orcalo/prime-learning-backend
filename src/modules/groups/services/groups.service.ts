import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { GroupRepository } from '../repository/group.repository';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { ManageMembersDto } from '../dto/manage-members.dto';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { successResponse } from '../../../common/constants/responses.constant';

@Injectable()
export class GroupsService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async create(dto: CreateGroupDto, currentUser: IAuthUser) {
    const memberIds = (dto.memberIds ?? []).map(id => new Types.ObjectId(id));
    const group = await this.groupRepository.create({
      name: dto.name,
      description: dto.description ?? '',
      members: memberIds,
      createdBy: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(group, 'Group created successfully', 201);
  }

  async findAll() {
    const groups = await this.groupRepository.findAll({ isDeleted: false });
    return successResponse(groups);
  }

  async findOne(id: string) {
    const group = await this.groupRepository.findById(id);
    if (!group || (group as any).isDeleted) throw new NotFoundException('Group not found');
    return successResponse(group);
  }

  async update(id: string, dto: UpdateGroupDto) {
    const updated = await this.groupRepository.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: dto },
    );
    if (!updated) throw new NotFoundException('Group not found');
    return successResponse(updated, 'Group updated successfully');
  }

  async remove(id: string) {
    const updated = await this.groupRepository.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true } },
    );
    if (!updated) throw new NotFoundException('Group not found');
    return successResponse(null, 'Group deleted successfully');
  }

  async addMembers(id: string, dto: ManageMembersDto) {
    const memberObjectIds = dto.memberIds.map(uid => new Types.ObjectId(uid));
    const updated = await this.groupRepository.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $addToSet: { members: { $each: memberObjectIds } } },
    );
    if (!updated) throw new NotFoundException('Group not found');
    return successResponse(updated, 'Members added successfully');
  }

  async removeMembers(id: string, dto: ManageMembersDto) {
    const memberObjectIds = dto.memberIds.map(uid => new Types.ObjectId(uid));
    const updated = await this.groupRepository.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $pullAll: { members: memberObjectIds } },
    );
    if (!updated) throw new NotFoundException('Group not found');
    return successResponse(updated, 'Members removed successfully');
  }
}
