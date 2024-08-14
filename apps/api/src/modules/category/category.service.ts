import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiDataService } from '@datn/prisma';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryOptionsDto } from './dto/category-query-options.dto';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { Prisma } from '@prisma/db-api';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: ApiDataService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const authUser = ContextProvider.getAuthUser();

    const user = await this.prisma.user.findUnique({
      where: {
        id: authUser.id,
      },
      include: {
        seller: true,
      },
    });

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        sellerId: user.seller.id,
      },
    });

    this.logger.log('Create category successfully');

    return category;
  }

  async findAll(queryOptionsDto: CategoryQueryOptionsDto) {
    const { take, skip, order, search, sellerId } = queryOptionsDto;

    let whereClause: Prisma.CategoryWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
        description: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      };
    }

    whereClause = {
      ...whereClause,
      sellerId: sellerId ? sellerId : undefined,
    };

    const [itemCount, categories] = await Promise.all([
      this.prisma.category.count({
        where: whereClause,
      }),
      this.prisma.category.findMany({
        take,
        skip,
        orderBy: {
          createdAt: order,
        },
        where: whereClause,
        include: {
          children: true,
          seller: true,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(categories, pageMetaDto);
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        seller: true,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        children: true,
        seller: true,
      },
    });

    this.logger.log('Update category successfully');

    return updatedCategory;
  }

  async remove(id: number) {
    await this.prisma.category.delete({ where: { id } });
  }
}
