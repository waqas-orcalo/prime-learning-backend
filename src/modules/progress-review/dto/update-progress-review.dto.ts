import { PartialType } from '@nestjs/swagger';
import { CreateProgressReviewDto } from './create-progress-review.dto';

export class UpdateProgressReviewDto extends PartialType(
  CreateProgressReviewDto,
) {}
