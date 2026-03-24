import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS, UserRole } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { ResourcesService } from '../services/resources.service';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { ListResourcesDto } from '../dto/list-resources.dto';

@ApiTags(API_TAGS.RESOURCES)
@ApiBearerAuth()
@Controller(CONTROLLERS.RESOURCES)
@UseGuards(RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // ── Create ───────────────────────────────────────────────────────────────────
  // No @Roles() → any authenticated user (JWT required by global JwtAuthGuard)
  @Post(API_ENDPOINTS.RESOURCES.CREATE)
  @ApiOperation({ summary: 'Create a new resource' })
  create(@Body() dto: CreateResourceDto, @CurrentUser() user: IAuthUser) {
    return this.resourcesService.create(dto, user);
  }

  // ── List ─────────────────────────────────────────────────────────────────────
  @Get(API_ENDPOINTS.RESOURCES.GET_ALL)
  @ApiOperation({ summary: 'List all resources with filtering & pagination' })
  findAll(@Query() dto: ListResourcesDto, @CurrentUser() user: IAuthUser) {
    return this.resourcesService.findAll(dto, user);
  }

  // ── Get one ───────────────────────────────────────────────────────────────────
  @Get(API_ENDPOINTS.RESOURCES.GET_ONE)
  @ApiOperation({ summary: 'Get a single resource by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.resourcesService.findOne(id, user);
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  @Patch(API_ENDPOINTS.RESOURCES.UPDATE)
  @ApiOperation({ summary: 'Update a resource' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.resourcesService.update(id, dto, user);
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  @Delete(API_ENDPOINTS.RESOURCES.DELETE)
  @ApiOperation({ summary: 'Soft-delete a resource' })
  remove(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.resourcesService.remove(id, user);
  }

  // ── Toggle bookmark ───────────────────────────────────────────────────────────
  @Post(API_ENDPOINTS.RESOURCES.TOGGLE_BOOKMARK)
  @ApiOperation({ summary: 'Toggle bookmark on a resource for the current user' })
  toggleBookmark(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.resourcesService.toggleBookmark(id, user);
  }

  // ── Toggle featured ───────────────────────────────────────────────────────────
  @Patch(API_ENDPOINTS.RESOURCES.TOGGLE_FEATURED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Toggle featured flag on a resource (admin only)' })
  toggleFeatured(@Param('id') id: string) {
    return this.resourcesService.toggleFeatured(id);
  }

  // ── Record view ───────────────────────────────────────────────────────────────
  @Post(API_ENDPOINTS.RESOURCES.INCREMENT_VIEW)
  @ApiOperation({ summary: 'Increment view count for a resource' })
  incrementView(@Param('id') id: string) {
    return this.resourcesService.incrementView(id);
  }

  // ── Record download ───────────────────────────────────────────────────────────
  @Post(API_ENDPOINTS.RESOURCES.INCREMENT_DOWNLOAD)
  @ApiOperation({ summary: 'Increment download count for a resource' })
  incrementDownload(@Param('id') id: string) {
    return this.resourcesService.incrementDownload(id);
  }
}
