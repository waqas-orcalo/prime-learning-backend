import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery, Types } from 'mongoose';
import { Group } from '../schemas/group.schema';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class GroupRepository {
  constructor(
    @InjectModel(Group.name) private readonly model: Model<Group>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // ── Internal helper: fetch user summaries for an array of member IDs ────────
  private async populateMembers(memberIds: any[]): Promise<any[]> {
    if (!memberIds || memberIds.length === 0) return [];
    const ids = memberIds.map(m =>
      typeof m === 'object' && m._id ? m._id : m,
    );
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .select('firstName lastName email role')
      .lean();
    // Return in same order as original member list
    const userMap = new Map(users.map((u: any) => [String(u._id), u]));
    return ids.map(id => userMap.get(String(id)) ?? { _id: String(id) });
  }

  // ── Internal helper: attach populated members to raw group docs ─────────────
  private async attachMembers(groups: any[]): Promise<any[]> {
    // Collect all unique member IDs across all groups
    const allIds: any[] = [];
    for (const g of groups) {
      for (const m of g.members ?? []) allIds.push(m);
    }
    if (allIds.length === 0) return groups;

    const users = await this.userModel
      .find({ _id: { $in: allIds } })
      .select('firstName lastName email role')
      .lean();
    const userMap = new Map(users.map((u: any) => [String(u._id), u]));

    return groups.map(g => ({
      ...g,
      members: (g.members ?? []).map((m: any) => {
        const id = typeof m === 'object' && m._id ? String(m._id) : String(m);
        return userMap.get(id) ?? { _id: id };
      }),
    }));
  }

  async create(doc: Partial<Group>): Promise<Group> {
    const created = new this.model({ _id: new Types.ObjectId(), ...doc });
    return created.save() as unknown as Group;
  }

  async findAll(filter: FilterQuery<Group> = {}): Promise<Group[]> {
    const raw = await this.model.find(filter).lean();
    return this.attachMembers(raw) as unknown as Group[];
  }

  async findById(id: string): Promise<Group | null> {
    const raw = await this.model.findById(id).lean();
    if (!raw) return null;
    const [populated] = await this.attachMembers([raw]);
    return populated as unknown as Group;
  }

  async findOneAndUpdate(
    filter: FilterQuery<Group>,
    update: UpdateQuery<Group>,
  ): Promise<Group | null> {
    const raw = await this.model
      .findOneAndUpdate(filter, update, { new: true, lean: true })
      .exec();
    if (!raw) return null;
    const [populated] = await this.attachMembers([raw]);
    return populated as unknown as Group;
  }

  async countMembers(groupId: string): Promise<number> {
    const group = await this.model.findById(groupId).select('members').lean();
    return (group as any)?.members?.length ?? 0;
  }
}
