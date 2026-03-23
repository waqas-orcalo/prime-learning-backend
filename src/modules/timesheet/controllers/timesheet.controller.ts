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
import { TimesheetService } from '../services/timesheet.service';
import { CreateTimesheetEntryDto } from '../dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from '../dto/update-timesheet-entry.dto';

@ApiTags(API_TAGS.TIMESHEET)
@ApiBearerAuth()
@Controller(CONTROLLERS.TIMESHEET)
@UseGuards(RolesGuard)
export class TimesheetController {
  constructor(private readonly service: TimesheetService) {}

  @Post(API_ENDPOINTS.TIMESHEET.CREATE)
  @ApiOperation({ summary: 'Create a timesheet entry' })
  create(@Body() dto: CreateTimesheetEntryDto, @CurrentUser() user: IAuthUser) {
    return this.service.create(dto, user);
  }

  @Get(API_ENDPOINTS.TIMESHEET.GET_ALL)
  @ApiOperation({ summary: 'Get all timesheet entries' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.TIMESHEET.STATS)
  @ApiOperation({ summary: 'Get OTJ stats summary' })
  getStats(@CurrentUser() user: IAuthUser) {
    return this.service.getStats(user);
  }

  @Get('/activity/:activityId')
  @ApiOperation({ summary: 'Get timesheet entries for a specific learning activity' })
  findByActivity(@Param('activityId') activityId: string) {
    return this.service.findByActivity(activityId);
  }

  @Get(API_ENDPOINTS.TIMESHEET.GET_ONE)
  @ApiOperation({ summary: 'Get a timesheet entry by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(API_ENDPOINTS.TIMESHEET.UPDATE)
  @ApiOperation({ summary: 'Update a timesheet entry' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTimesheetEntryDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(API_ENDPOINTS.TIMESHEET.DELETE)
  @ApiOperation({ summary: 'Delete a timesheet entry' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
