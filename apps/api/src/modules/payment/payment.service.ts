import { Injectable, Logger } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ApiDataService } from '@datn/prisma';
import { ConfigService } from '@nestjs/config';
import { ENUM_VNPAY_COMMAND } from './payment.contant';
import { sortObject } from './helpers/sort-object.helper';
import qs from 'qs';
import * as crypto from 'crypto';
import {
  CreatePaymentUrlParams,
  SortedObject,
  VnpParams,
  VnpQueryParams,
} from './payment.interface';
import { ProductService } from '../product/product.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { RabbitService } from '@datn/rabbitmq';
import { CancelOrderEvent, PaymentOrderEvent } from '../order/order.event';
import { SellerService } from '../seller/seller.service';
import { OrderStatus } from '@prisma/db-api';

dayjs.extend(utc);

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly rabbitService: RabbitService,
    private readonly sellerService: SellerService,
  ) {}

  async createPaymentUrl(params: CreatePaymentUrlParams) {
    const vnpVersion =
      this.configService.getOrThrow<string>('payment.vnpVersion');
    const vnpTmnCode =
      this.configService.getOrThrow<string>('payment.vnpTmnCode');
    const vnpLocale =
      this.configService.getOrThrow<string>('payment.vnpLocale');
    const vnpCurrCode = this.configService.getOrThrow<string>(
      'payment.vnpCurrCode',
    );
    const vnpReturnUrl = this.configService.getOrThrow<string>(
      'payment.vnpReturnUrl',
    );
    const vnpHashSecret = this.configService.getOrThrow<string>(
      'payment.vnpHashSecret',
    );
    const vnpUrl = this.configService.getOrThrow<string>('payment.vnpUrl');

    const vnpParams: Partial<VnpParams> = {
      vnp_Version: vnpVersion,
      vnp_TmnCode: vnpTmnCode,
      vnp_Locale: vnpLocale,
      vnp_CurrCode: vnpCurrCode,
      vnp_ReturnUrl: vnpReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_Command: ENUM_VNPAY_COMMAND.PAY,
      vnp_OrderInfo: `Thanh toan hoa don. So tien ${params.totalPrice}`,
      vnp_OrderType: 'Thanh toán hóa đơn',
      vnp_Amount: params.totalPrice * 100,
      vnp_CreateDate: dayjs.utc(params.createdAt).format('YYYYMMDDHHmmss'),
      vnp_TxnRef: params.vnpTxnRef,
    };

    const sortedParam: SortedObject<string | number> = sortObject(vnpParams);

    const signData: string = qs.stringify(sortedParam, { encode: false });

    const hmac = crypto.createHmac('sha512', vnpHashSecret);

    sortedParam.vnp_SecureHash = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const finalVnpUrl: string =
      vnpUrl + '?' + qs.stringify(sortedParam, { encode: false });

    this.logger.log('Create payment url success');

    return { finalVnpUrl };
  }

  async findPayment(code: string) {
    return this.txHost.tx.payment.findUnique({
      where: { vnpTxnRef: code },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    seller: {
                      select: {
                        id: true,
                        userId: true,
                      },
                    },
                  },
                },
              },
            },
            customer: true,
          },
        },
      },
    });
  }

  update(paymentId: number, params: VnpQueryParams, isPaid: boolean) {
    return this.txHost.tx.payment.update({
      where: { id: paymentId },
      data: {
        isPaid,
        vnpBankCode: params.vnp_BankCode,
        vnpBankTranNo: params.vnp_BankTranNo,
        vnpCardType: params.vnp_CardType,
        vnpPayDate: new Date(),
        vnpOrderInfo: params.vnp_OrderInfo,
        vnpTxnRef: params.vnp_TxnRef,
        vnpTransactionNo: params.vnp_TransactionNo,
      },
    });
  }

  @Transactional<TransactionalAdapterPrisma>()
  async processReturnUrl(query: VnpQueryParams) {
    const vnpParams: VnpQueryParams = query;
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = sortObject(vnpParams);

    const secretKey = this.configService.getOrThrow<string>(
      'payment.vnpHashSecret',
    );

    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const payment = await this.findPayment(vnpParams.vnp_TxnRef);

    this.logger.log(payment);

    if (secureHash === signed) {
      this.logger.log('Secure hash valid');
      await this.update(payment.id, vnpParams, true);

      await Promise.all(
        payment.orders.map(async (order) => {
          //TODO: use func from order service
          await this.txHost.tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              status: OrderStatus.PAID,
            },
          });

          for (const item of order.orderItems) {
            await this.productService.decreaseProductQuantity(
              item.productId,
              item.quantity,
            );

            await this.productService.increaseSoldCount(
              item.productId,
              item.quantity,
            );

            await this.sellerService.increaseSoldCount(
              item.product.seller.id,
              item.quantity,
            );

            try {
              await this.rabbitService.publish(
                PaymentOrderEvent.EVENT_NAME,
                'all',
                new PaymentOrderEvent(
                  order.id,
                  order.customer,
                  item.product.seller.userId, // recipient
                  order.paymentType,
                ).toJSON(),
              );
            } catch (error) {
              this.logger.error(
                `Failed to send notification message for order ${order.id}: ${error}`,
              );
            }
          }
        }),
      );
    } else {
      this.logger.log('Secure hash invalid');
      await this.update(payment.id, vnpParams, false);

      await Promise.all(
        payment.orders.map(async (order) => {
          await this.txHost.tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELED },
          });

          for (const item of order.orderItems) {
            await this.productService.increaseProductQuantity(
              item.productId,
              item.quantity,
            );

            try {
              await this.rabbitService.publish(
                CancelOrderEvent.EVENT_NAME,
                'all',
                new CancelOrderEvent(
                  order.id,
                  order.customer,
                  item.product.seller.userId,
                ).toJSON(),
              );
            } catch (error) {
              this.logger.error(
                `Failed to emit event for order ${order.id}: ${error}`,
              );
            }
          }

          const REDIRECT_URL: string =
            this.configService.getOrThrow('app.frontendURL') +
            '/marketplace/payment-failed';

          return { url: REDIRECT_URL };
        }),
      );
    }

    const REDIRECT_URL: string =
      this.configService.getOrThrow('app.frontendURL') +
      '/marketplace/payment-success';

    return { url: REDIRECT_URL };
  }
}
