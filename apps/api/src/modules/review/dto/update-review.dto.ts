import { CreateReviewDto } from './create-review.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['creatorId', 'orderItemId'] as const),
) {}
