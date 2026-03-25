import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ScorecardService } from '../services/scorecard.service';
import { CreateScorecardDto } from '../dto/create-scorecard.dto';
import { UpdateScorecardDto } from '../dto/update-scorecard.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Controller('scorecard')
export class ScorecardController {
  constructor(private readonly service: ScorecardService) {}

  /** POST /scorecard — create a new scorecard */
  @Post()
  create(@Body() dto: CreateScorecardDto, @CurrentUser() user: IAuthUser) {
    return this.service.create(dto, user);
  }

  /** GET /scorecard — list scorecards (paginated, optional dateFrom filter) */
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('dateFrom') dateFrom?: string,
    @CurrentUser() user?: IAuthUser,
  ) {
    return this.service.findAll(+page, +limit, dateFrom, user!);
  }

  /** GET /scorecard/:id — get single scorecard */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /** PATCH /scorecard/:id — save scores / update draft */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScorecardDto) {
    return this.service.update(id, dto);
  }

  /** POST /scorecard/:id/submit — mark as submitted */
  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  /** DELETE /scorecard/:id — soft delete */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
