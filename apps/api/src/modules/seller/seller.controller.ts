import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { SellerProductsQueryOptionsDto } from './dto/seller-products-query-options.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UserRole } from '@prisma/db-api';
import { ROUTES } from '../../constants';
import { SellerQueryOptionsDto } from './dto/seller-query-options.dto';

@ApiTags('Sellers')
@Controller(ROUTES.SELLERS)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Auth()
  @Get('/me')
  async getMySellerInfo() {
    const data = await this.sellerService.getMySellerInfo();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get my seller info successfully',
      data,
    );
  }

  @Auth([], { public: true })
  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async getSellerById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.sellerService.getSellerById(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get seller successfully',
      data,
    );
  }

  @Auth([UserRole.ADMIN])
  @Get()
  async getSellers(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: SellerQueryOptionsDto,
  ) {
    const data = await this.sellerService.getSellers(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get sellers successfully',
      data,
    );
  }

  @Auth([], { public: true })
  @Get(':id/products')
  @ApiParam({ name: 'id', type: Number })
  async getProductsOfSeller(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: SellerProductsQueryOptionsDto,
  ) {
    const data = await this.sellerService.getProductsOfSeller(
      id,
      queryOptionsDto,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get products of seller successfully',
      data,
    );
  }

  @Auth()
  @Patch()
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
        address: {
          type: 'string',
          nullable: true,
        },
        logo: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async updateProfile(
    @Body() updateSellerDto: UpdateSellerDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    logo: Express.Multer.File,
  ) {
    const data = await this.sellerService.updateSeller(updateSellerDto, logo);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Update seller successfully',
      data,
    );
  }
}
