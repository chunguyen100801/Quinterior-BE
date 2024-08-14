import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ApiDataService } from '@datn/prisma';
import { ContextProvider } from '@datn/shared';
import dayjs from 'dayjs';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  private DEFAULT_CREDIT_DAILY = 100;

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
  ) {}

  async getUsage() {
    this.logger.log('Retrieving daily credit usage');

    const authUser = ContextProvider.getAuthUser();
    const startOfDay = dayjs().startOf('day').toDate();
    const checkCredit = await this.txHost.tx.creditDaily.findFirst({
      where: {
        userId: authUser.id,
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    if (!checkCredit) {
      const newCredit = await this.txHost.tx.creditDaily.create({
        data: {
          userId: authUser.id,
          credits: this.DEFAULT_CREDIT_DAILY,
          version: 0,
        },
      });

      return {
        usage: this.DEFAULT_CREDIT_DAILY - newCredit.credits,
        total: newCredit.credits,
      };
    }

    return {
      usage: this.DEFAULT_CREDIT_DAILY - checkCredit.credits,
      total: this.DEFAULT_CREDIT_DAILY,
    };
  }

  @Transactional<TransactionalAdapterPrisma>()
  async useCredit(): Promise<void> {
    const authUser = ContextProvider.getAuthUser();
    const startOfDay = dayjs().startOf('day').toDate();

    let availableCredit = await this.txHost.tx.creditDaily.findFirst({
      where: {
        userId: authUser.id,
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    if (!availableCredit) {
      availableCredit = await this.txHost.tx.creditDaily.create({
        data: {
          userId: authUser.id,
          credits: this.DEFAULT_CREDIT_DAILY,
          version: 0,
        },
      });
    }

    if (availableCredit.credits <= 0) {
      throw new HttpException(
        HttpException.createBody(
          null,
          'Credit limit reached. Please purchase more credits to continue.',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const credits = await this.txHost.tx.creditDaily.updateMany({
      where: {
        id: availableCredit.id,
        version: availableCredit.version,
      },
      data: {
        credits: {
          decrement: 1,
        },
        version: {
          increment: 1,
        },
      },
    });

    if (credits.count === 0) {
      throw new BadRequestException(`This credit is used! Please try again.`);
    }

    this.logger.log(
      `credit used by user ${authUser.id}. Remaining credits: ${
        availableCredit.credits - 1
      }`,
    );
  }

  async refundCredit(): Promise<void> {
    const authUser = ContextProvider.getAuthUser();
    const startOfDay = dayjs().startOf('day').toDate();
    const credit = await this.txHost.tx.creditDaily.findFirst({
      where: {
        userId: authUser.id,
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    if (!credit) {
      throw new HttpException(
        'credit record not found for refund',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.txHost.tx.creditDaily.update({
      where: {
        id: credit.id,
      },
      data: {
        credits: {
          increment: 1,
        },
      },
    });
  }
}
