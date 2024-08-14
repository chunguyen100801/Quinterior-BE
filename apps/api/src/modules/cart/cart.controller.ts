import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { CartService } from './cart.service';
import { DeleteProductsDto } from './dto/delete-products.dto';
import { AddProductDto } from './dto/add-product.dto';
import { ChangeProductQuantityDto } from './dto/change-product-quantity.dto';
import { SimilarProductsCartQueryOptionsDto } from './dto/similar-products-cart-query-options.dto';
import { ROUTES } from '../../constants';

@ApiTags('Carts')
@Controller(ROUTES.CARTS)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth()
  @Get('/me')
  async getMyCart() {
    const data = await this.cartService.getMyCart();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get my cart successfully',
      data,
    );
  }

  @Auth()
  @Get('products')
  async getProductsInCart() {
    const data = await this.cartService.getProductsInCart();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get products in cart successfully',
      data,
    );
  }

  @Auth()
  @Get('products/similar')
  async getSimilarProductsInCart(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: SimilarProductsCartQueryOptionsDto,
  ) {
    const data =
      await this.cartService.getSimilarProductsInCart(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get similar products in cart successfully',
      data,
    );
  }

  @Auth()
  @Post('products')
  @ApiBody({
    type: AddProductDto,
  })
  async addProductToCart(@Body() addProductDto: AddProductDto) {
    const data = await this.cartService.addProductToCart(addProductDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Add product to cart successfully',
      data,
    );
  }

  @Auth()
  @Patch('products/change-quantity')
  @ApiBody({
    type: ChangeProductQuantityDto,
  })
  async changeProductQuantity(
    @Body() changeProductQuantityDto: ChangeProductQuantityDto,
  ) {
    const data = await this.cartService.changeProductQuantity(
      changeProductQuantityDto,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Change product quantity successfully',
      data,
    );
  }

  @Auth()
  @Delete('products/:productId')
  @ApiParam({ name: 'productId', required: true, type: 'number' })
  async removeProductFromCart(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const data = await this.cartService.removeProductFromCart(productId);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Remove product from cart successfully',
      data,
    );
  }

  @Auth()
  @Delete('products')
  async removeProductsFromCart(@Body() deleteProductsDto: DeleteProductsDto) {
    const data =
      await this.cartService.removeProductsFromCart(deleteProductsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Remove products from cart successfully',
      data,
    );
  }
}
