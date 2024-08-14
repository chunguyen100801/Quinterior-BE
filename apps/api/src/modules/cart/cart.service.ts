import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContextProvider } from '@datn/shared';
import { ApiDataService } from '@datn/prisma';
import { DeleteProductsDto } from './dto/delete-products.dto';
import { ProductService } from '../product/product.service';
import { CartProducts } from './cart.interface';
import { AddProductDto } from './dto/add-product.dto';
import { ChangeProductQuantityDto } from './dto/change-product-quantity.dto';
import { SimilarProductsCartQueryOptionsDto } from './dto/similar-products-cart-query-options.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly productService: ProductService,
  ) {}

  createCart(userId: number) {
    return this.txHost.tx.cart.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  getMyCart() {
    return this.validateCartAndUser();
  }

  async getProductsInCart() {
    const cart = await this.validateCartAndUser();

    return this.txHost.tx.product.findMany({
      where: {
        id: {
          in: cart.cartProducts.map((cartProduct) => cartProduct.productId),
        },
      },
      include: {
        seller: true,
      },
    });
  }

  async addProductToCart({ productId, quantity }: AddProductDto) {
    const cart = await this.validateCartAndUser();

    const productIsAvailable = cart.cartProducts.find(
      (product) => product.productId === productId,
    );

    const product = await this.txHost.tx.product.findUnique({
      where: { id: productId },
    });

    if (product.quantity < quantity + productIsAvailable?.quantity) {
      throw new BadRequestException('Product is out of stock');
    }

    const updatedCart = await this.txHost.tx.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        cartProducts: productIsAvailable
          ? {
              update: {
                where: {
                  cartId_productId: {
                    cartId: cart.id,
                    productId,
                  },
                },
                data: {
                  quantity: {
                    increment: quantity,
                  },
                },
              },
            }
          : {
              create: {
                productId,
                quantity,
              },
            },
        totalProduct: {
          increment: quantity,
        },
      },
      include: {
        cartProducts: {
          include: {
            product: {
              include: {
                seller: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    this.logger.log('Add product to cart successfully');

    return updatedCart;
  }

  async changeProductQuantity(
    changeProductQuantityDto: ChangeProductQuantityDto,
  ) {
    const { productId, quantity } = changeProductQuantityDto;
    const authUser = ContextProvider.getAuthUser();

    const cartProduct = await this.txHost.tx.cartProduct.findUnique({
      where: {
        cartId_productId: { cartId: authUser.cartId, productId: productId },
      },
    });

    if (!cartProduct) {
      throw new NotFoundException('Product not found in cart');
    }

    const updatedCart = await this.txHost.tx.cart.update({
      where: {
        id: authUser.cartId,
      },
      data: {
        cartProducts: {
          update: {
            where: {
              cartId_productId: {
                cartId: authUser.cartId,
                productId,
              },
            },
            data: {
              quantity,
            },
          },
        },
      },
      include: {
        cartProducts: {
          include: {
            product: {
              include: {
                seller: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    this.logger.log('Change product quantity successfully');

    return updatedCart;
  }

  async removeProductFromCart(productId: number) {
    const cart = await this.validateCartAndUser();

    if (cart.cartProducts.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    if (
      !cart.cartProducts.some(
        (cartProduct) => cartProduct.productId === productId,
      )
    ) {
      throw new BadRequestException('Product not found in cart');
    }

    const updatedCart = await this.txHost.tx.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        cartProducts: {
          deleteMany: {
            productId,
          },
        },
        totalProduct: {
          decrement: 1,
        },
      },
      include: {
        cartProducts: {
          include: {
            product: {
              include: {
                seller: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    this.logger.log('Remove product from cart successfully');

    return updatedCart;
  }

  async decreaseProductQuantity(
    productId: number,
    quantity: number,
  ): Promise<void> {
    const cart = await this.validateCartAndUser();

    if (cart.cartProducts.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const product = cart.cartProducts.find(
      (cartProduct) => cartProduct.productId === productId,
    );

    if (!product) {
      throw new NotFoundException('Product not found in cart');
    }

    if (product.quantity - quantity > 0) {
      await this.txHost.tx.cartProduct.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });
    } else {
      await this.txHost.tx.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          cartProducts: {
            deleteMany: {
              productId,
            },
          },
          totalProduct: {
            decrement: 1,
          },
        },
      });
    }

    this.logger.log('change product quantity in cart successfully');
  }

  async getSimilarProductsInCart(
    queryOptionsDto: SimilarProductsCartQueryOptionsDto,
  ) {
    const cart = await this.validateCartAndUser();

    const productIds: number[] = cart.cartProducts.map(
      (cartProduct) => cartProduct.productId,
    );

    return this.productService.getSimilarProductsByProductIds(
      productIds,
      queryOptionsDto,
    );
  }

  async removeProductsFromCart(deleteProductsDto: DeleteProductsDto) {
    const { productIds } = deleteProductsDto;
    const cart = await this.validateCartAndUser();

    if (cart.cartProducts.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const productsInCart = cart.cartProducts.map(
      (cartProduct) => cartProduct.productId,
    );

    const validProductIds = productIds.filter((id) =>
      productsInCart.includes(id),
    );

    if (validProductIds.length === 0) {
      throw new BadRequestException('No valid product IDs provided');
    }

    const updatedCart = await this.txHost.tx.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        cartProducts: {
          deleteMany: {
            productId: {
              in: validProductIds,
            },
          },
        },
        totalProduct: {
          decrement: validProductIds.length,
        },
      },
      include: {
        cartProducts: {
          include: {
            product: {
              include: {
                seller: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    this.logger.log('Remove products from cart successfully');

    return updatedCart;
  }

  private async validateCartAndUser(): Promise<CartProducts> {
    const authUser = ContextProvider.getAuthUser();

    const cart = await this.txHost.tx.cart.findUnique({
      where: { id: authUser.cartId },
      include: {
        cartProducts: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            product: {
              include: {
                seller: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }
}
