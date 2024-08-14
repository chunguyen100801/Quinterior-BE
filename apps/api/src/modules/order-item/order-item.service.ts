import { PaymentType, Product, Seller, User } from '@prisma/db-api';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ApiDataService } from '@datn/prisma';
import { RabbitService } from '@datn/rabbitmq';
import { CreateOrderEvent } from '../order/order.event';

@Injectable()
export class OrderItemService {
  private readonly logger = new Logger(OrderItemService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly rabbitService: RabbitService,
  ) {}

  async create(
    orderId: number,
    paymentType: PaymentType,
    creator: User,
    product: Product & { seller: Seller },
  ) {
    this.logger.log('Create order item');
    const orderItem = await this.txHost.tx.orderItem.create({
      data: {
        price: product.price,
        quantity: product.quantity,
        product: {
          connect: {
            id: product.id,
          },
        },
        order: {
          connect: {
            id: orderId,
          },
        },
      },
    });

    try {
      await this.rabbitService.publish(
        CreateOrderEvent.EVENT_NAME,
        'all',
        new CreateOrderEvent(
          orderId,
          creator,
          product.seller.userId, // recipient
          paymentType,
        ).toJSON(),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification message for order ${orderId}: ${error}`,
      );
    }

    return orderItem;
  }

  async findOne(id: number) {
    const orderItem = await this.txHost.tx.orderItem.findUnique({
      where: {
        id: id,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }
  }

  async findAllByOrderId(orderId: number) {
    return this.txHost.tx.orderItem.findMany({
      where: {
        orderId,
      },
    });
  }

  async delete(orderId: number) {
    return this.txHost.tx.orderItem.delete({
      where: {
        id: orderId,
      },
    });
  }
}
