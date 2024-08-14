import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiDataService } from '@datn/prisma';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryOptionsDto } from './dto/review-query-options.dto';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RabbitService } from '@datn/rabbitmq';
import { CreateReviewEvent } from './review.event';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ProductService } from '../product/product.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly rabbitService: RabbitService,
    private readonly productService: ProductService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const authUser = ContextProvider.getAuthUser();
    const { rating } = createReviewDto;

    const productReview = await this.txHost.tx.review.findUnique({
      where: {
        creatorId: authUser.id,
        orderItemId: createReviewDto.orderItemId,
      },
      include: {
        orderItem: {
          select: {
            productId: true,
          },
        },
      },
    });

    if (productReview) {
      this.logger.error('You can only review a product you have purchased');
      throw new BadRequestException(
        'You can only review a product you have purchased',
      );
    }

    const review = await this.txHost.tx.review.create({
      data: createReviewDto,
      include: {
        creator: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItem: {
          select: {
            productId: true,
            product: {
              select: {
                seller: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Increase product rating counter`);

    await this.productService.increaseRatingCount(
      productReview.orderItem.productId,
      rating,
    );

    await this.rabbitService.publish(
      CreateReviewEvent.EVENT_NAME,
      'all',
      new CreateReviewEvent(
        review.orderItem.productId,
        authUser,
        review.orderItem.product.seller.userId,
        review.id,
      ).toJSON(),
    );

    this.logger.log(`Created review successfully`);

    return review;
  }

  async findAll(queryOptionalDto: ReviewQueryOptionsDto) {
    const { take, skip, order, productId } = queryOptionalDto;

    const [itemCount, reviews] = await Promise.all([
      this.txHost.tx.review.count({
        where: {
          orderItem: {
            productId: productId,
          },
        },
      }),
      this.txHost.tx.review.findMany({
        where: {
          orderItem: {
            productId: productId,
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
          orderItem: {
            select: {
              productId: true,
              product: {
                select: {
                  seller: true,
                },
              },
            },
          },
        },
        skip: skip,
        take,
        orderBy: {
          rating: order,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionalDto,
    });

    return new PageDto(reviews, pageMetaDto);
  }

  async findOne(id: number) {
    const review = await this.txHost.tx.review.findUnique({
      where: {
        id,
      },
      include: {
        creator: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItem: {
          select: {
            productId: true,
            product: {
              select: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found ');
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const authUser = ContextProvider.getAuthUser();

    const review = await this.txHost.tx.review.findUnique({
      where: {
        id: id,
        creatorId: authUser.id,
      },
      include: {
        orderItem: {
          select: {
            productId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.productService.decreaseRatingCount(
      review.orderItem.productId,
      review.rating,
    );

    const updatedReview = await this.txHost.tx.review.update({
      where: {
        id: id,
        creatorId: authUser.id,
      },
      data: updateReviewDto,
      include: {
        creator: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItem: {
          select: {
            productId: true,
            product: {
              select: {
                seller: true,
              },
            },
          },
        },
      },
    });

    await this.productService.increaseRatingCount(
      updatedReview.orderItem.productId,
      updateReviewDto.rating,
    );

    return updatedReview;
  }

  async delete(id: number) {
    const authUser = ContextProvider.getAuthUser();

    const deletedReview = await this.txHost.tx.review.delete({
      where: {
        id,
        orderItem: {
          product: {
            sellerId: authUser.id,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItem: {
          select: {
            productId: true,
            product: {
              select: {
                seller: true,
              },
            },
          },
        },
      },
    });

    this.logger.log('Decrease rating count in product count');

    await this.productService.decreaseRatingCount(
      deletedReview.orderItem.productId,
      deletedReview.rating,
    );
  }

  async checkReview(orderItemId: number) {
    const authUser = ContextProvider.getAuthUser();

    const review = await this.txHost.tx.review.findUnique({
      where: {
        creatorId: authUser.id,
        orderItemId: orderItemId,
      },
    });

    if (review) {
      this.logger.error('You have already reviewed this product');
      return false;
    }

    return true;
  }

  async replyReview(id: number, replyReviewDto: ReplyReviewDto) {
    const authUser = ContextProvider.getAuthUser();

    const review = await this.txHost.tx.review.findUnique({
      where: {
        id,
        orderItem: {
          product: {
            sellerId: authUser.id,
          },
        },
      },
    });

    if (!review) {
      this.logger.error('Review not found');
      throw new NotFoundException('Review not found');
    }

    return this.txHost.tx.review.update({
      where: {
        id,
      },
      data: {
        reply: replyReviewDto.reply,
      },
      include: {
        creator: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItem: {
          select: {
            productId: true,
            product: {
              select: {
                seller: true,
              },
            },
          },
        },
      },
    });
  }
}
