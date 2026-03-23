import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_TAGS, CONTROLLERS } from '../../../common/constants';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CriteriaService } from '../services/criteria.service';
import { CreateCriteriaDto } from '../dto/create-criteria.dto';
import { SetActivityCriteriaDto } from '../dto/set-activity-criteria.dto';

@ApiTags(API_TAGS.CRITERIA)
@ApiBearerAuth()
@Controller(CONTROLLERS.CRITERIA)
@UseGuards(RolesGuard)
export class CriteriaController {
  constructor(private readonly service: CriteriaService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a criteria item' })
  create(@Body() dto: CreateCriteriaDto) {
    return this.service.create(dto);
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all criteria' })
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.findAll(page, limit);
  }

  @Get('/activity/:activityId')
  @ApiOperation({ summary: 'Get criteria selected for a learning activity' })
  getForActivity(@Param('activityId') activityId: string) {
    return this.service.getForActivity(activityId);
  }

  @Post('/activity/:activityId')
  @ApiOperation({ summary: 'Set criteria for a learning activity (replaces existing)' })
  setForActivity(
    @Param('activityId') activityId: string,
    @Body() dto: SetActivityCriteriaDto,
  ) {
    return this.service.setForActivity(activityId, dto);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a criteria item by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a criteria item' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCriteriaDto>) {
    return this.service.update(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a criteria item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
