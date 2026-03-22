import { PartialType } from '@nestjs/swagger';
import { CreatePlanOfActivityDto } from './create-plan-of-activity.dto';

export class UpdatePlanOfActivityDto extends PartialType(
  CreatePlanOfActivityDto,
) {}
