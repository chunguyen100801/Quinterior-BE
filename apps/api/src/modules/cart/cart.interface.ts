import { Cart, CartProduct, Product } from '@prisma/db-api';

export interface CartProducts extends Cart {
  cartProducts: (CartProduct & {
    product: Product;
  })[];
}
