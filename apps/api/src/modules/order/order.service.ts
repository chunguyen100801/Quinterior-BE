import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { ApiDataService } from '@datn/prisma';
import {
  OrderItem,
  OrderStatus,
  PaymentType,
  Prisma,
  Product,
  Seller,
  UserRole,
} from '@prisma/db-api';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryOptionsDto } from './dto/order-query-options.dto';
import { ChangeOrderStatusEvent } from './order.event';
import { RabbitService } from '@datn/rabbitmq';
import { OrderItemService } from '../order-item/order-item.service';
import { CreateOrderItemDto } from '../order-item/dto/create-order-item.dto';
import { CartService } from '../cart/cart.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { ProductService } from '../product/product.service';
import { PaymentService } from '../payment/payment.service';
import { groupBy, map } from 'lodash';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly rabbitService: RabbitService,
    private readonly orderItemService: OrderItemService,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async create(ipAddr: string, createOrderDto: CreateOrderDto) {
    const { products, paymentType, note, addressId } = createOrderDto;
    const authUser = ContextProvider.getAuthUser();

    this.logger.log('Start create order transaction');

    const productOrder = await this.checkProductAvailable(products);

    const productsGroupBySeller = groupBy(
      productOrder.productItems,
      'sellerId',
    );

    const payment = await this.txHost.tx.payment.create({
      data: {
        vnpTxnRef: nanoid(10),
      },
    });

    const orders = await Promise.all(
      map(productsGroupBySeller, async (products, sellerId) => {
        const totalPrice: number = products.reduce((total, product) => {
          return total + product.price * product.quantity;
        }, 0);

        const order = await this.txHost.tx.order.create({
          data: {
            orderCode: nanoid(10),
            customer: {
              connect: {
                id: authUser.id,
              },
            },
            seller: {
              connect: {
                id: Number(sellerId),
              },
            },
            address: {
              connect: {
                id: addressId,
              },
            },
            totalPrice: totalPrice,
            note: note,
            paymentType: paymentType,
            payment: {
              connect: {
                id: payment.id,
              },
            },
          },
        });

        await Promise.all(
          products.map(async (product: Product & { seller: Seller }) => {
            await this.cartService.decreaseProductQuantity(
              product.id,
              product.quantity,
            );

            this.logger.log(
              `Change product ${product.id} quantity in cart when create order`,
            );

            return this.orderItemService.create(
              order.id,
              paymentType,
              authUser,
              product,
            );
          }),
        );

        return this.txHost.tx.order.findUnique({
          where: {
            id: order.id,
          },
          include: {
            seller: true,
            orderItems: {
              include: {
                product: true,
                review: true,
              },
            },
            address: true,
            customer: {
              select: {
                id: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      }),
    );

    if (paymentType === PaymentType.TRANSFER) {
      const url = await this.paymentService.createPaymentUrl({
        ipAddr: ipAddr,
        totalPrice: productOrder.totalPrice,
        createdAt: orders[0].createdAt,
        vnpTxnRef: payment.vnpTxnRef,
      });

      return {
        url: url,
        orders: orders,
      };
    }

    this.logger.log('End create order transaction');

    return {
      orders: orders,
    };
  }

  async findOne(id: number) {
    const authUser = ContextProvider.getAuthUser();
    const order = await this.txHost.tx.order.findUnique({
      where: {
        id: id,
        payment: {
          isPaid: true,
        },
        paymentType: PaymentType.TRANSFER,
      },
      include: {
        seller: true,
        orderItems: {
          include: {
            product: {
              include: {
                categories: true,
              },
            },
            review: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.customerId !== authUser.id && order.sellerId !== authUser.id) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  async getSalesHistory(queryOptionsDto: OrderQueryOptionsDto) {
    const { skip, take, search, order, status, startDate, endDate } =
      queryOptionsDto;
    const authUser = ContextProvider.getAuthUser();

    let whereClause: Prisma.OrderWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            orderCode: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            customer: {
              OR: [
                {
                  firstName: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      };
    }

    whereClause = {
      ...whereClause,
      status: status,
      orderItems: {
        some: {
          product: {
            sellerId: authUser.id,
          },
        },
      },
      payment: {
        isPaid: true,
      },
      paymentType: PaymentType.TRANSFER,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [itemCount, orders] = await Promise.all([
      this.txHost.tx.order.count({
        where: whereClause,
      }),
      this.txHost.tx.order.findMany({
        where: whereClause,
        skip: skip,
        take,
        orderBy: {
          createdAt: order,
        },
        include: {
          seller: true,
          orderItems: {
            include: {
              product: {
                include: {
                  categories: true,
                },
              },
              review: true,
            },
          },
          address: true,
          customer: {
            select: {
              id: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(orders, pageMetaDto);
  }

  async findAll(queryOptionsDto: OrderQueryOptionsDto) {
    const {
      skip,
      take,
      search,
      order,
      customerId,
      sellerId,
      status,
      startDate,
      endDate,
    } = queryOptionsDto;
    const authUser = ContextProvider.getAuthUser();

    let whereClause: Prisma.OrderWhereInput = {};

    if (customerId && customerId !== authUser.id) {
      throw new BadRequestException('You dont have access to resource');
    }

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            orderCode: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            orderItems: {
              some: {
                product: {
                  seller: {
                    name: {
                      contains: searchQuery,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          },
        ],
      };
    }

    whereClause = {
      ...whereClause,
      customerId: authUser.id,
      status: status,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      orderItems: sellerId
        ? {
            some: {
              product: {
                sellerId: sellerId,
              },
            },
          }
        : undefined,
      payment: {
        isPaid: true,
      },
      paymentType: PaymentType.TRANSFER,
    };

    const [itemCount, orders] = await Promise.all([
      this.txHost.tx.order.count({
        where: whereClause,
      }),
      this.txHost.tx.order.findMany({
        where: whereClause,
        skip: skip,
        take,
        orderBy: {
          createdAt: order,
        },
        include: {
          seller: true,
          orderItems: {
            include: {
              product: {
                include: {
                  categories: true,
                },
              },
              review: true,
            },
          },
          address: true,
          customer: {
            select: {
              id: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(orders, pageMetaDto);
  }

  @Transactional<TransactionalAdapterPrisma>()
  async updateOrderStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const authUser = ContextProvider.getAuthUser();
    const order = await this.txHost.tx.order.findUnique({
      where: {
        id: id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                seller: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.customerId !== authUser.id) {
      switch (`${order.status} to ${updateOrderStatusDto.status}`) {
        case `${OrderStatus.PAID} to ${OrderStatus.CONFIRMED}`:
          break;
        case `${OrderStatus.CONFIRMED} to ${OrderStatus.DELIVERING}`:
          break;
        case `${OrderStatus.DELIVERING} to ${OrderStatus.RECEIVED}`:
          break;
        case `${OrderStatus.PROCESSING} to ${OrderStatus.CANCELED}`:
          //TODO: refund money
          await Promise.all(
            order.orderItems.map(async (orderItem: OrderItem) => {
              await this.productService.increaseProductQuantity(
                orderItem.productId,
                orderItem.quantity,
              );
            }),
          );
          break;
        default:
          throw new BadRequestException('Cannot update order status');
      }

      await Promise.all(
        order.orderItems.map(async (orderItem) => {
          const product = orderItem.product;
          try {
            await this.rabbitService.publish(
              ChangeOrderStatusEvent.EVENT_NAME,
              'all',
              new ChangeOrderStatusEvent(
                order.id,
                product.seller.user,
                authUser.id,
                updateOrderStatusDto.status,
              ).toJSON(),
            );
          } catch (error) {
            this.logger.error(
              `Failed to emit event for order ${order.id}: ${error}`,
            );
          }
        }),
      );
    } else {
      switch (updateOrderStatusDto.status) {
        case OrderStatus.CANCELED:
          if (
            order.status === OrderStatus.DELIVERING ||
            order.status === OrderStatus.RECEIVED
          ) {
            throw new BadRequestException('Cannot cancel order');
          }
          break;
        case OrderStatus.RECEIVED:
          if (
            order.status === OrderStatus.DELIVERING ||
            order.status === OrderStatus.CANCELED
          ) {
            throw new BadRequestException('Cannot update order status');
          }

          break;
        default:
          throw new BadRequestException('Cannot update order status');
      }

      await Promise.all(
        order.orderItems.map(async (orderItem) => {
          const product = orderItem.product;
          try {
            await this.rabbitService.publish(
              ChangeOrderStatusEvent.EVENT_NAME,
              'all',
              new ChangeOrderStatusEvent(
                order.id,
                authUser,
                product.seller.userId,
                updateOrderStatusDto.status,
              ).toJSON(),
            );
          } catch (error) {
            this.logger.error(
              `Failed to emit event for order ${order.id}: ${error}`,
            );
          }
        }),
      );
    }

    const updatedOrder = await this.txHost.tx.order.update({
      where: {
        id: id,
      },
      data: {
        status: updateOrderStatusDto.status,
      },
      include: {
        seller: true,
        orderItems: {
          include: {
            product: true,
            review: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log('Update order successfully');

    return updatedOrder;
  }

  async getRevenueByDate(date: string) {
    const authUser = ContextProvider.getAuthUser();
    const startDate = dayjs(date).startOf('day').toDate();
    const endDate = dayjs(date).endOf('day').toDate();

    const orders = await this.txHost.tx.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        payment: {
          isPaid: true,
        },
        paymentType: PaymentType.TRANSFER,
        orderItems: {
          some: {
            product: {
              sellerId:
                authUser.role === UserRole.USER ? authUser.id : undefined,
            },
          },
        },
      },
      select: {
        totalPrice: true,
        paymentType: true,
        orderItems: {
          select: {
            id: true,
          },
        },
      },
    });

    let totalTransfer = 0;
    let totalProduct = 0;

    orders.forEach((order) => {
      if (order.paymentType === PaymentType.TRANSFER) {
        totalTransfer += order.totalPrice;
        totalProduct += order.orderItems.length;
      }
    });

    return {
      day: date,
      totalTransfer: totalTransfer,
      totalProduct: totalProduct,
    };
  }

  async getRevenueByYear(year: number) {
    const authUser = ContextProvider.getAuthUser();
    const startDate = dayjs().year(year).startOf('year').toDate();
    const endDate = dayjs().year(year).endOf('year').toDate();

    const orders = await this.txHost.tx.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        payment: {
          isPaid: true,
        },
        paymentType: PaymentType.TRANSFER,
        orderItems: {
          some: {
            product: {
              sellerId:
                authUser.role === UserRole.USER ? authUser.id : undefined,
            },
          },
        },
      },
      select: {
        totalPrice: true,
        orderItems: {
          select: {
            id: true,
          },
        },
        paymentType: true,
        createdAt: true,
      },
    });

    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalTransfer: 0,
      totalProduct: 0,
    }));

    orders.forEach((order) => {
      const month = dayjs(order.createdAt).month() + 1;

      if (order.paymentType === PaymentType.TRANSFER) {
        result[month - 1].totalTransfer += order.totalPrice;
      }

      result[month - 1].totalProduct += order.orderItems.length;
    });

    return result;
  }

  async delete(id: number) {
    const authUser = ContextProvider.getAuthUser();

    const order = await this.txHost.tx.order.findUnique({
      where: {
        id: id,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.customerId !== authUser.id) {
      throw new BadRequestException('Order not found');
    }

    await this.txHost.tx.order.delete({
      where: {
        id: id,
      },
    });
  }

  private async checkProductAvailable(
    createOrderItemDtos: CreateOrderItemDto[],
  ) {
    const productItems: Product[] = [];

    const productIds: number[] = createOrderItemDtos.map(
      (product: CreateOrderItemDto) => product.productId,
    );
    const productsOrders =
      await this.productService.findOrdersByIds(productIds);

    const totalPrice = productsOrders.reduce(
      (total: number, product: Product) => {
        const productOrder: CreateOrderItemDto = createOrderItemDtos.find(
          (productOrder: CreateOrderItemDto): boolean =>
            productOrder.productId === product.id,
        );

        if (!productOrder) {
          throw new BadRequestException(
            `Product with id ${product.id} not found in order`,
          );
        }

        if (productOrder.quantity > product.quantity) {
          throw new BadRequestException(
            `Product with id ${product.id} out of stock`,
          );
        }

        productItems.push({
          ...product,
          quantity: productOrder.quantity,
        });

        return total + product.price * productOrder.quantity;
      },
      0,
    );

    return { productItems, totalPrice };
  }
}
