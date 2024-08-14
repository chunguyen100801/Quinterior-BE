import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { ApiDataService } from '@datn/prisma';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { OrderStatus, Prisma } from '@prisma/db-api';
import { transformFilter } from './product.helper';
import { SimilarProductsQueryOptionsDto } from './dto/similar-products-query-options.dto';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ProductsQueryOptionsDto } from './dto/product-query-options.dto';
import { SellerService } from '../seller/seller.service';
import { StorageServiceAbstract } from '@datn/storage';
import { WeaviateService } from '@datn/weaviate';
import { ProductPurchasedQueryOptionsDto } from './dto/product-purchased-query-options.dto';
import { omit, uniq } from 'lodash';
import { ImageSearchQueryOptionsDto } from './dto/image-search-query-options.dto';
import { getKeyFromUrl } from '../../utils/get-key-from-url';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly prisma: ApiDataService,
    private readonly storageService: StorageServiceAbstract,
    private readonly weaviateService: WeaviateService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly sellerService: SellerService,
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async create(
    createProductDto: CreateProductDto,
    thumbnail: Express.Multer.File,
    images: Express.Multer.File[],
    model: Express.Multer.File | undefined,
  ) {
    const { categoryIds, modelData, ...rest } = createProductDto;
    const authUser = ContextProvider.getAuthUser();

    let imageUrls: string[];

    if (images && images.length > 0) {
      imageUrls = await Promise.all(
        images.map(async (image: Express.Multer.File): Promise<string> => {
          return this.storageService.createFile(authUser.id, {
            file: image,
            path: 'products',
          });
        }),
      );
    }

    const thumbnailUrl = await this.storageService.createFile(authUser.id, {
      file: thumbnail,
      path: 'products/thumbnail',
    });

    let modelUrl: string | undefined;

    if (model) {
      this.logger.log(`Type of model ${model.mimetype}`);
      modelUrl = await this.storageService.createFile(authUser.id, {
        file: model,
        path: 'products/model',
      });
    }

    this.logger.log('Start create product transaction');

    const seller = await this.prisma.seller.findUnique({
      where: { userId: authUser.id },
    });

    if (!seller) {
      throw new BadRequestException('Seller not found');
    }

    try {
      const product = await this.txHost.tx.product.create({
        data: {
          ...rest,
          categories: {
            connect: categoryIds?.map((id: number) => ({ id })),
          },
          seller: {
            connect: {
              id: seller.id,
            },
          },
          images: imageUrls,
          thumbnail: thumbnailUrl,
          model: modelData
            ? {
                create: {
                  url: modelUrl,
                  x: modelData.x,
                  y: modelData.y,
                  z: modelData.z,
                  type: modelData.type,
                },
              }
            : undefined,
        },
        include: {
          model: true,
        },
      });

      await this.sellerService.increaseProductCount(authUser.id);

      if (product?.model) {
        this.logger.log('Update file data');
        await this.storageService.updateFile(getKeyFromUrl(product.model.url), {
          productModelId: product.model.id,
        });

        const productUrls = [...product.images, product.thumbnail];

        this.logger.log('Save new interior to weaviate database');

        await this.weaviateService.saveNewInterior(
          productUrls,
          product?.model ? product.model?.url : product.name,
          product.name,
          product.id,
        );
      }

      this.logger.log('End create product transaction, product created');

      return product;
    } catch (error) {
      this.logger.error('Error create product', error);
      throw new BadRequestException('Error create product');
    }
  }

  async findAll(queryOptionsDto: ProductsQueryOptionsDto) {
    const { skip, take, order, search, categoryIds, price, rating, sellerId } =
      queryOptionsDto;

    let whereClause: Prisma.ProductWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            seller: {
              OR: [
                {
                  name: {
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
      categories: categoryIds
        ? {
            some: {
              id: {
                in: categoryIds.trim().split(',').map(Number),
              },
            },
          }
        : undefined,
      price: price ? transformFilter(price) : undefined,
      avgRating: rating ? transformFilter(rating) : undefined,
      sellerId: sellerId ? { equals: Number(sellerId) } : undefined,
      quantity: { gt: 0 },
      isDeleted: false,
    };

    const [itemCount, products] = await Promise.all([
      this.prisma.product.count({
        where: whereClause,
      }),
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          price: order,
        },
        include: {
          seller: true,
          categories: true,
          model: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(products, pageMetaDto);
  }

  async getPurchasedProducts(queryOptionsDto: ProductPurchasedQueryOptionsDto) {
    const { skip, take, search, order } = queryOptionsDto;
    const authUser = ContextProvider.getAuthUser();

    let whereClause: Prisma.ProductWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            seller: {
              OR: [
                {
                  name: {
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
      orderItems: {
        some: {
          order: {
            customer: {
              id: authUser.id,
            },
            status: OrderStatus.RECEIVED,
          },
        },
      },
      quantity: { gt: 0 },
      isDeleted: false,
    };

    const [itemCount, products] = await Promise.all([
      this.prisma.product.count({
        where: whereClause,
      }),
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          orderItems: {
            _count: order,
          },
        },
        include: {
          seller: true,
          categories: true,
          model: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(products, pageMetaDto);
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
      include: {
        seller: true,
        categories: true,
        model: {
          include: {
            file: {
              select: {
                type: true,
                size: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findAllSimilarById(
    productId: number,
    queryOptionsDto: SimilarProductsQueryOptionsDto,
  ) {
    const { skip, take, order } = queryOptionsDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId, quantity: { gt: 0 }, isDeleted: false },
      include: { categories: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const categoryIds: number[] = product.categories.map(
      (category) => category.id,
    );

    const whereClause: Prisma.ProductWhereInput = {
      id: {
        not: productId,
      },
      OR: [
        {
          categories: {
            some: {
              id: {
                in: categoryIds,
              },
            },
          },
        },
        {
          name: {
            contains: product.name.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: product.name.trim(),
            mode: 'insensitive',
          },
        },
      ],
      isDeleted: false,
      quantity: { gt: 0 },
    };

    const [itemCount, products] = await Promise.all([
      this.prisma.product.count({
        where: whereClause,
      }),
      this.prisma.product.findMany({
        where: whereClause,
        skip: skip,
        take,
        orderBy: {
          price: order,
        },
        include: {
          seller: true,
          categories: true,
          model: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(products, pageMetaDto);
  }

  async imageSearch(
    file: Express.Multer.File,
    queryOptionsDto: ImageSearchQueryOptionsDto,
  ) {
    const { take, skip, order, categoryIds, price, rating, sellerId } =
      queryOptionsDto;

    const fileBase64 = file.buffer.toString('base64');
    const vectors = await this.weaviateService.interiorImageSearch(
      fileBase64,
      0.8,
      '',
      20,
      0,
    );

    const productIds: number[] = uniq(
      vectors.map((vector) => vector.productID),
    );

    const whereClause: Prisma.ProductWhereInput = {
      id: {
        in: productIds,
      },
      quantity: { gt: 0 },
      categories: categoryIds
        ? {
            some: {
              id: {
                in: categoryIds.trim().split(',').map(Number),
              },
            },
          }
        : undefined,
      price: price ? transformFilter(price) : undefined,
      avgRating: rating ? transformFilter(rating) : undefined,
      sellerId: sellerId ? { equals: Number(sellerId) } : undefined,
      isDeleted: false,
    };

    const [itemCount, products] = await Promise.all([
      this.prisma.product.count({
        where: whereClause,
      }),
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          price: order,
        },
        include: {
          seller: true,
          categories: true,
          model: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(products, pageMetaDto);
  }

  public async getSimilarProductsByProductIds(
    productIds: number[],
    queryOptionsDto: SimilarProductsQueryOptionsDto,
  ) {
    const { skip, take, order } = queryOptionsDto;

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        quantity: { gt: 0 },
        isDeleted: false,
      },
      include: { categories: true },
    });

    const categoryIds: number[] = [];

    products.map((product) =>
      product.categories.map((category) => {
        categoryIds.push(category.id);
      }),
    );

    const whereClause: Prisma.ProductWhereInput = {
      id: {
        notIn: productIds,
      },
      //TODO: add similar products by name, description, and category
      categories: {
        some: {
          id: {
            in: categoryIds,
          },
        },
      },
      isDeleted: false,
    };

    const [itemCount, similarProducts] = await Promise.all([
      this.prisma.product.count({
        where: whereClause,
      }),
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          price: order,
        },
        include: {
          seller: true,
          categories: true,
          model: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(similarProducts, pageMetaDto);
  }

  @Transactional<TransactionalAdapterPrisma>()
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    thumbnail: Express.Multer.File | undefined,
    images: Express.Multer.File[],
    model: Express.Multer.File | undefined,
  ) {
    const authUser = ContextProvider.getAuthUser();

    const { modelData, categoryIds } = updateProductDto;

    const product = await this.findOne(id);

    let imageUrls: string[] = [];
    if (images && images.length > 0 && imageUrls.length > 0) {
      imageUrls = await Promise.all(
        images.map(async (image: Express.Multer.File): Promise<string> => {
          return this.storageService.createFile(authUser.id, {
            file: image,
            path: 'products',
          });
        }),
      );
    }

    let thumbnailUrl: string | undefined;

    if (thumbnail) {
      if (product.thumbnail) {
        await this.storageService.deleteFile(product.thumbnail);
      }
      thumbnailUrl = await this.storageService.createFile(authUser.id, {
        file: thumbnail,
        path: 'products/thumbnail',
      });
    }

    let modelUrl: string | undefined;

    if (model) {
      if (product.model) {
        await this.storageService.deleteFile(product.thumbnail);
      }
      modelUrl = await this.storageService.createFile(authUser.id, {
        file: model,
        path: 'products/model',
      });
    }

    const updatedProduct = await this.txHost.tx.product.update({
      where: { id, isDeleted: false },
      data: {
        ...omit(updateProductDto, ['modelData', 'categoryIds']),
        images: images && images.length > 0 ? imageUrls : undefined,
        thumbnail: thumbnail ? thumbnailUrl : undefined,
        categories:
          categoryIds && categoryIds.length > 0
            ? {
                disconnect: product.categories.map((category) => {
                  return { id: category.id };
                }),
                connect: categoryIds.map((id: number) => {
                  return {
                    id: id,
                  };
                }),
              }
            : undefined,
        model: modelData
          ? {
              update: {
                url: model ? modelUrl : undefined,
                x: modelData.x,
                y: modelData.y,
                z: modelData.z,
              },
            }
          : undefined,
      },
      include: {
        seller: true,
        categories: true,
        model: true,
      },
    });

    if (model) {
      await this.storageService.updateFile(getKeyFromUrl(product.model.url), {
        productModelId: product.model.id,
      });
    }

    if (thumbnail || model || images) {
      const productUrls = [...updatedProduct.images, updatedProduct.thumbnail];
      await this.weaviateService.saveNewInterior(
        productUrls,
        updatedProduct.model.url,
        updatedProduct.name,
        updatedProduct.id,
      );
    }

    return updatedProduct;
  }

  @Transactional<TransactionalAdapterPrisma>()
  async remove(id: number) {
    try {
      this.logger.log('Start delete product transaction');
      const product = await this.txHost.tx.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await this.sellerService.decreaseProductCount(product.sellerId);
    } catch (error) {
      this.logger.error('Error delete product', error);
      throw new BadRequestException('Error delete product');
    }
  }

  async deleteProductsByUserId(userId: number): Promise<void> {
    this.logger.log('Delete products of user id');
    await this.txHost.tx.product.deleteMany({
      where: {
        sellerId: userId,
      },
    });
  }

  async findOrdersByIds(ids: number[]) {
    return this.txHost.tx.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        seller: true,
      },
    });
  }

  async increaseRatingCount(id: number, rating: number): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        totalRating: product.totalRating + 1,
        avgRating:
          (product.avgRating * product.totalRating + rating) /
          (product.totalRating + 1),
      },
    });
  }

  async decreaseRatingCount(id: number, rating: number): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        totalRating: product.totalRating - 1,
        avgRating:
          (product.avgRating * product.totalRating - rating) /
          (product.totalRating - 1),
      },
    });
  }

  async increaseProductQuantity(id: number, quantity: number): Promise<void> {
    await this.txHost.tx.product.update({
      where: { id },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async decreaseProductQuantity(id: number, quantity: number): Promise<void> {
    await this.txHost.tx.product.update({
      where: {
        id,
        quantity: {
          gte: 1,
        },
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async increaseSoldCount(id: number, quantity: number): Promise<void> {
    await this.txHost.tx.product.update({
      where: { id },
      data: {
        sold: {
          increment: quantity,
        },
      },
    });
  }
}
