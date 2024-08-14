import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { ReviewQueryOptionsDto } from './dto/review-query-options.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ROUTES } from '../../constants';

@ApiTags('Reviews')
@Controller(ROUTES.REVIEWS)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Auth()
  @Get('can-review/:orderItemId')
  async checkReview(@Param('orderItemId', ParseIntPipe) orderItemId: number) {
    const data: boolean = await this.reviewService.checkReview(orderItemId);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      data
        ? 'You can review this product'
        : 'You cannot review this product, please check your order',
      data,
    );
  }

  @Auth()
  @Post()
  @ApiBody({ type: CreateReviewDto })
  async create(@Body() createReviewDto: CreateReviewDto) {
    const data = await this.reviewService.create(createReviewDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Review created successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id/reply')
  async replyReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() replyReviewDto: ReplyReviewDto,
  ) {
    const data = await this.reviewService.replyReview(id, replyReviewDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Reply to review successfully',
      data,
    );
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionalDto: ReviewQueryOptionsDto,
  ) {
    const data = await this.reviewService.findAll(queryOptionalDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get reviews successfully',
      data,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reviewService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get review by id successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id')
  @ApiBody({ type: UpdateReviewDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const data = await this.reviewService.update(id, updateReviewDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Review updated successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reviewService.delete(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Review deleted successfully',
      data,
    );
  }
}
