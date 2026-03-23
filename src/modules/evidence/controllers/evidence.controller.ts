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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { EvidenceService } from '../services/evidence.service';
import { CreateEvidenceDto } from '../dto/create-evidence.dto';
import { UpdateEvidenceDto } from '../dto/update-evidence.dto';

@ApiTags(API_TAGS.EVIDENCE)
@ApiBearerAuth()
@Controller(CONTROLLERS.EVIDENCE)
@UseGuards(RolesGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post(API_ENDPOINTS.EVIDENCE.GET_ALL)
  @ApiOperation({ summary: 'Save evidence for a learning activity' })
  create(@Body() dto: CreateEvidenceDto, @CurrentUser() user: IAuthUser) {
    return this.evidenceService.create(dto, user);
  }

  @Get('/activity/:activityId')
  @ApiOperation({ summary: 'Get evidence for a learning activity' })
  findByActivity(@Param('activityId') activityId: string) {
    return this.evidenceService.findByActivity(activityId);
  }

  @Get(API_ENDPOINTS.EVIDENCE.GET_ONE)
  @ApiOperation({ summary: 'Get evidence by ID' })
  findOne(@Param('id') id: string) {
    return this.evidenceService.findOne(id);
  }

  @Patch(API_ENDPOINTS.EVIDENCE.DELETE)
  @ApiOperation({ summary: 'Update evidence' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEvidenceDto,
  ) {
    return this.evidenceService.update(id, dto);
  }

  @Delete(API_ENDPOINTS.EVIDENCE.DELETE)
  @ApiOperation({ summary: 'Soft-delete evidence' })
  remove(@Param('id') id: string) {
    return this.evidenceService.remove(id);
  }
}
