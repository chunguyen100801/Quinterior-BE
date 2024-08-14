import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ProductImagesValidatePipe } from './pipes/product-images-validate.pipe';
import { SimilarProductsQueryOptionsDto } from './dto/similar-products-query-options.dto';
import { ProductsQueryOptionsDto } from './dto/product-query-options.dto';
import { ROUTES } from '../../constants';
import { ProductPurchasedQueryOptionsDto } from './dto/product-purchased-query-options.dto';
import { ImageSearchQueryOptionsDto } from './dto/image-search-query-options.dto';

@ApiTags('Products')
@Controller(ROUTES.PRODUCTS)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth()
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          nullable: false,
        },
        description: {
          type: 'string',
          nullable: true,
        },
        background: {
          type: 'string',
          nullable: true,
        },
        quantity: {
          type: 'number',
          nullable: false,
        },
        price: {
          type: 'number',
          nullable: false,
        },
        categoryIds: {
          type: 'array',
          items: {
            type: 'number',
          },
          nullable: false,
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            nullable: false,
          },
        },
        model: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        modelData: {
          type: 'object',
          properties: {
            x: {
              type: 'number',
              nullable: false,
            },
            y: {
              type: 'number',
              nullable: false,
            },
            z: {
              type: 'number',
              nullable: false,
            },
            type: {
              type: 'string',
              enum: [
                'FLOOR_ITEM',
                'IN_WALL_ITEM',
                'CORNER_ITEM',
                'WALL_ITEM',
                'DECORATE_ITEM',
                'ROOF_ITEM',
              ],
              nullable: false,
            },
          },
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'thumbnail',
        maxCount: 1,
      },
      { name: 'images', maxCount: 7 },
      { name: 'model', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ProductImagesValidatePipe({
        thumbnailRequired: true,
        imagesRequired: true,
      }),
    )
    files: {
      thumbnail: Express.Multer.File[];
      images: Express.Multer.File[];
      model: Express.Multer.File[];
    },
  ) {
    const data = await this.productService.create(
      createProductDto,
      files.thumbnail[0],
      files.images,
      files.model ? files.model[0] : undefined,
    );

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Create product successfully',
      data,
    );
  }

  @Auth([], { public: true })
  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: ProductsQueryOptionsDto,
  ) {
    const data = await this.productService.findAll(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get products successfully',
      data,
    );
  }

  @Auth()
  @Get('purchased')
  async getPurchasedProducts(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: ProductPurchasedQueryOptionsDto,
  ) {
    const data =
      await this.productService.getPurchasedProducts(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get purchased products successfully',
      data,
    );
  }

  @Auth([], { public: true })
  @Post('image-search')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to upload',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async imageSearch(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: ImageSearchQueryOptionsDto,
  ) {
    const data = await this.productService.imageSearch(image, queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Image search successfully',
      data,
    );
  }

  @Auth([], { public: true })
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get product by id successfully',
      data,
    );
  }

  @Get(':id/similar')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  async findAllSimilarById(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: SimilarProductsQueryOptionsDto,
  ) {
    const data = await this.productService.findAllSimilarById(
      id,
      queryOptionsDto,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get similar products successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          nullable: true,
        },
        description: {
          type: 'string',
          nullable: true,
        },
        background: {
          type: 'string',
          nullable: true,
        },
        quantity: {
          type: 'number',
          nullable: true,
        },
        price: {
          type: 'number',
          nullable: true,
        },
        categoryIds: {
          type: 'array',
          items: {
            type: 'number',
          },
          nullable: true,
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            nullable: true,
          },
        },
        model: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        modelData: {
          type: 'object',
          properties: {
            x: {
              type: 'number',
              nullable: true,
            },
            y: {
              type: 'number',
              nullable: true,
            },
            z: {
              type: 'number',
              nullable: true,
            },
          },
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'thumbnail',
        maxCount: 1,
      },
      { name: 'images', maxCount: 7 },
      { name: 'model', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(
      new ProductImagesValidatePipe({
        thumbnailRequired: false,
        imagesRequired: false,
      }),
    )
    files: {
      thumbnail: Express.Multer.File[];
      images: Express.Multer.File[];
      model: Express.Multer.File[];
    },
  ) {
    const data = await this.productService.update(
      id,
      updateProductDto,
      files.thumbnail ? files.thumbnail[0] : undefined,
      files.images,
      files.model ? files.model[0] : undefined,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Update product successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);

    return new ResponseSuccessDto(HttpStatus.OK, 'Delete product successfully');
  }
}
