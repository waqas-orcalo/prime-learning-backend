import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ResourceRepository } from '../repository/resource.repository';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { ListResourcesDto } from '../dto/list-resources.dto';
import { ShareResourceDto } from '../dto/share-resource.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

/** Roles that can see ALL resources regardless of ownership/sharing */
const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN];

@Injectable()
export class ResourcesService {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  // ── Create ───────────────────────────────────────────────────────────────────
  async create(dto: CreateResourceDto, currentUser: IAuthUser) {
    const resource = await this.resourceRepository.create({
      ...dto,
      uploadedBy: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(resource, ResponseMessage.CREATED, 201);
  }

  // ── List ─────────────────────────────────────────────────────────────────────
  async findAll(dto: ListResourcesDto, currentUser: IAuthUser) {
    const page  = Math.max(1, parseInt(String(dto.page  ?? 1),  10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(dto.limit ?? 20), 10) || 20));

    const isAdmin = ADMIN_ROLES.includes(currentUser.role as UserRole);

    const { data, total } = await this.resourceRepository.findAllPaginated(page, limit, {
      search:             dto.search,
      type:               dto.type,
      category:           dto.category,
      visibility:         dto.visibility,
      featured:           dto.featured === 'true' ? true : undefined,
      bookmarkedByUserId: dto.bookmarked === 'true' ? currentUser._id : undefined,
      // Admins see everything; everyone else sees only own + shared-with-them resources
      accessUserId:       isAdmin ? undefined : currentUser._id,
      skipAccessFilter:   isAdmin,
    });

    // Annotate each resource with whether the current user bookmarked it,
    // whether they own it, and who it's been shared with
    const userId = currentUser._id;
    const annotated = data.map((r: any) => ({
      ...r,
      bookmarked: Array.isArray(r.bookmarkedBy)
        ? r.bookmarkedBy.some((id: any) => id.toString() === userId)
        : false,
      isOwner: r.uploadedBy?._id
        ? r.uploadedBy._id.toString() === userId
        : r.uploadedBy?.toString() === userId,
    }));

    return paginatedResponse(annotated, total, page, limit);
  }

  // ── Get One ───────────────────────────────────────────────────────────────────
  async findOne(id: string, currentUser: IAuthUser) {
    const resource = await this.resourceRepository.findByIdPopulated(id);
    if (!resource || (resource as any).isDeleted) {
      return successResponse(null, 'Resource not found');
    }

    // Access check: only owner, shared users, or admins can view
    const isAdmin = ADMIN_ROLES.includes(currentUser.role as UserRole);
    const uploaderIdStr = (resource as any).uploadedBy?._id?.toString() ?? (resource as any).uploadedBy?.toString();
    const isOwner = uploaderIdStr === currentUser._id;
    const isSharedWith = Array.isArray((resource as any).sharedWith)
      ? (resource as any).sharedWith.some((uid: any) => uid.toString() === currentUser._id)
      : false;

    if (!isAdmin && !isOwner && !isSharedWith) {
      throw new ForbiddenException('You do not have access to this resource.');
    }

    const userId = currentUser._id;
    const annotated = {
      ...resource,
      bookmarked: Array.isArray((resource as any).bookmarkedBy)
        ? (resource as any).bookmarkedBy.some((id: any) => id.toString() === userId)
        : false,
      isOwner,
    };
    return successResponse(annotated);
  }

  // ── Share ─────────────────────────────────────────────────────────────────────
  async shareResource(id: string, dto: ShareResourceDto, currentUser: IAuthUser) {
    const existing = await this.resourceRepository.findById(id);
    if (!existing || (existing as any).isDeleted) {
      throw new NotFoundException('Resource not found.');
    }

    // Only the owner or admins can share
    const isAdmin = ADMIN_ROLES.includes(currentUser.role as UserRole);
    const isOwner = (existing as any).uploadedBy.toString() === currentUser._id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only the resource owner can share it.');
    }

    const updated = await this.resourceRepository.shareWithUsers(id, dto.userIds);
    return successResponse(updated, 'Resource shared successfully');
  }

  // ── Revoke Share ──────────────────────────────────────────────────────────────
  async revokeShare(id: string, userId: string, currentUser: IAuthUser) {
    const existing = await this.resourceRepository.findById(id);
    if (!existing || (existing as any).isDeleted) {
      throw new NotFoundException('Resource not found.');
    }

    const isAdmin = ADMIN_ROLES.includes(currentUser.role as UserRole);
    const isOwner = (existing as any).uploadedBy.toString() === currentUser._id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only the resource owner can revoke access.');
    }

    const updated = await this.resourceRepository.revokeShare(id, userId);
    return successResponse(updated, 'Access revoked successfully');
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateResourceDto, currentUser: IAuthUser) {
    const existing = await this.resourceRepository.findById(id);

    // Only uploader, trainer+, or admin can update
    const canEdit =
      (existing as any).uploadedBy.toString() === currentUser._id ||
      [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER].includes(currentUser.role as any);

    if (!canEdit) throw new ForbiddenException('You do not have permission to edit this resource.');

    const updated = await this.resourceRepository.findOneAndUpdate(
      { _id: id },
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  // ── Soft-delete ───────────────────────────────────────────────────────────────
  async remove(id: string, currentUser: IAuthUser) {
    const existing = await this.resourceRepository.findById(id);

    const canDelete =
      (existing as any).uploadedBy.toString() === currentUser._id ||
      [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role as any);

    if (!canDelete) throw new ForbiddenException('You do not have permission to delete this resource.');

    await this.resourceRepository.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } });
    return successResponse(null, ResponseMessage.DELETED);
  }

  // ── Toggle bookmark ───────────────────────────────────────────────────────────
  async toggleBookmark(id: string, currentUser: IAuthUser) {
    const updated = await this.resourceRepository.toggleBookmark(id, currentUser._id);
    const userId = currentUser._id;
    const bookmarked = Array.isArray((updated as any)?.bookmarkedBy)
      ? (updated as any).bookmarkedBy.some((bid: any) => bid.toString() === userId)
      : false;
    return successResponse({ ...(updated as any), bookmarked }, bookmarked ? 'Resource bookmarked' : 'Bookmark removed');
  }

  // ── Toggle featured ───────────────────────────────────────────────────────────
  async toggleFeatured(id: string) {
    const existing = await this.resourceRepository.findById(id);
    const newFeatured = !(existing as any).featured;
    const updated = await this.resourceRepository.findOneAndUpdate(
      { _id: id },
      { $set: { featured: newFeatured } },
    );
    return successResponse(updated, newFeatured ? 'Resource marked as featured' : 'Feature removed');
  }

  // ── Increment view count ──────────────────────────────────────────────────────
  async incrementView(id: string) {
    await this.resourceRepository.incrementViews(id);
    return successResponse(null, 'View recorded');
  }

  // ── Increment download count ──────────────────────────────────────────────────
  async incrementDownload(id: string) {
    await this.resourceRepository.incrementDownloads(id);
    return successResponse(null, 'Download recorded');
  }
}
