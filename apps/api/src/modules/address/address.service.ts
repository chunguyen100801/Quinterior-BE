import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { ApiDataService } from '@datn/prisma';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ContextProvider } from '@datn/shared';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from '@prisma/db-api';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async create(createAddressDto: CreateAddressDto) {
    const authUser = ContextProvider.getAuthUser();
    const { isDefault } = createAddressDto;

    let result: Address;

    if (isDefault === true) {
      const checker = await this.txHost.tx.address.findFirst({
        where: {
          userId: authUser.id,
          isDefault: true,
          isDeleted: false,
        },
      });

      if (checker) {
        await this.txHost.tx.address.update({
          where: {
            id: checker.id,
          },
          data: {
            isDefault: false,
          },
        });
      }

      result = await this.txHost.tx.address.create({
        data: {
          ...createAddressDto,
          userId: authUser.id,
        },
      });
    } else {
      const checker = await this.txHost.tx.address.findFirst({
        where: {
          userId: authUser.id,
          isDefault: true,
          isDeleted: false,
        },
      });

      if (!checker) {
        result = await this.txHost.tx.address.create({
          data: {
            isDefault: true,
            ...createAddressDto,
            userId: authUser.id,
          },
        });
      } else {
        result = await this.txHost.tx.address.create({
          data: {
            ...createAddressDto,
            userId: authUser.id,
          },
        });
      }
    }

    this.logger.log(`Created address successfully: ${result.id}`);

    return result;
  }

  async findAll() {
    const authUser = ContextProvider.getAuthUser();
    return this.txHost.tx.address.findMany({
      where: {
        userId: authUser.id,
        isDeleted: false,
      },
    });
  }

  async findOne(id: number) {
    const address = await this.txHost.tx.address.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  @Transactional<TransactionalAdapterPrisma>()
  async update(id: number, updateAddressDto: UpdateAddressDto) {
    const authUser = ContextProvider.getAuthUser();
    const { isDefault } = updateAddressDto;
    if (isDefault) {
      const checker = await this.txHost.tx.address.findFirst({
        where: {
          userId: authUser.id,
          isDefault: true,
          isDeleted: false,
        },
      });

      if (checker) {
        await this.txHost.tx.address.update({
          where: {
            id: checker.id,
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    return this.txHost.tx.address.update({
      where: { id, isDeleted: false },
      data: updateAddressDto,
    });
  }

  @Transactional<TransactionalAdapterPrisma>()
  async remove(id: number) {
    const address = await this.txHost.tx.address.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.txHost.tx.address.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isDefault: false },
    });

    if (address.isDefault) {
      const newDefaultAddress = await this.txHost.tx.address.findFirst({
        where: {
          userId: address.userId,
          isDeleted: false,
          id: {
            not: address.id,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      await this.txHost.tx.address.update({
        where: {
          id: newDefaultAddress.id,
        },
        data: {
          isDeleted: true,
        },
      });
    }
  }
}
