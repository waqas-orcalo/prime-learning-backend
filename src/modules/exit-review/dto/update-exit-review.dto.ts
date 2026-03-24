import { PartialType } from '@nestjs/swagger';
import { CreateExitReviewDto } from './create-exit-review.dto';

export class UpdateExitReviewDto extends PartialType(CreateExitReviewDto) {}
