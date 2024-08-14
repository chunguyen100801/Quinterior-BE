import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ApiDataService } from '@datn/prisma';
import { SellerProductsQueryOptionsDto } from './dto/seller-products-query-options.dto';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { StorageServiceAbstract } from '@datn/storage';
import { getKeyFromUrl } from '../../utils/get-key-from-url';
import { SellerQueryOptionsDto } from './dto/seller-query-options.dto';

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly storageService: StorageServiceAbstract,
  ) {}

  createSeller(userId: number, name: string) {
    return this.txHost.tx.seller.create({
      data: {
        name,
        userId,
      },
    });
  }

  async getSellerById(id: number) {
    const seller = await this.txHost.tx.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async getMySellerInfo() {
    const authUser = ContextProvider.getAuthUser();
    const seller = await this.txHost.tx.seller.findUnique({
      where: { userId: authUser.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async getSellers(queryOptionsDto: SellerQueryOptionsDto) {
    const { skip, take, order } = queryOptionsDto;
    const [itemCount, sellers] = await Promise.all([
      this.txHost.tx.seller.count(),
      this.txHost.tx.seller.findMany({
        skip,
        take,
        orderBy: {
          createdAt: order,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
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

    return new PageDto(sellers, pageMetaDto);
  }

  async getProductsOfSeller(
    id: number,
    queryOptionsDto: SellerProductsQueryOptionsDto,
  ) {
    const { skip, take, order } = queryOptionsDto;

    const [itemCount, products] = await Promise.all([
      this.txHost.tx.product.count({
        where: {
          sellerId: id,
        },
      }),
      this.txHost.tx.product.findMany({
        where: {
          sellerId: id,
        },
        skip: skip,
        take,
        orderBy: {
          price: order,
        },
        include: {
          categories: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(products, pageMetaDto);
  }

  async updateSeller(
    updateSellerDto: UpdateSellerDto,
    logo: Express.Multer.File,
  ) {
    const authUser = ContextProvider.getAuthUser();
    let logoUrl: string;

    if (logo) {
      const seller = await this.getMySellerInfo();

      if (seller.logo) {
        const oldKey = getKeyFromUrl(seller.logo);
        await this.storageService.deleteFile(oldKey);
      }

      logoUrl = await this.storageService.createFile(authUser.id, {
        file: logo,
      });
    }

    const seller = await this.txHost.tx.seller.update({
      where: { userId: authUser.id },
      data: {
        ...updateSellerDto,
        logo: logoUrl,
      },
    });

    return seller;
  }

  public async increaseProductCount(userId: number, quantity: number = 1) {
    this.logger.log('Increase product count transaction started');
    await this.txHost.tx.seller.update({
      where: { id: userId },
      data: {
        totalProduct: {
          increment: quantity,
        },
      },
    });
  }

  public async decreaseProductCount(userId: number, quantity: number = 1) {
    this.logger.log('Decrease product count transaction started');
    await this.txHost.tx.seller.update({
      where: { id: userId },
      data: {
        totalProduct: {
          decrement: quantity,
        },
      },
    });
  }

  public async increaseSoldCount(userId: number, quantity: number = 1) {
    this.logger.log('Increase sold count transaction started');
    await this.txHost.tx.seller.update({
      where: { id: userId },
      data: {
        totalSold: {
          increment: quantity,
        },
      },
    });
  }
}
