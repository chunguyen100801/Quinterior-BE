import { OrderStatus, PrismaClient } from '@prisma/db-api';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const createOrders = async () => {
  console.log('Seeding orders...');
  const addresses = await prisma.address.findMany({
    where: {
      userId: 7,
    },
  });

  await Promise.all([
    Object.values(OrderStatus).map(async (value, index) => {
      console.log(`Seeding orders for status ${value}`);

      Array.from({ length: 5 }).map(async (_, i) => {
        const products = await prisma.product.findMany({
          where: {
            id: {
              in: Array.from({ length: 3 }, (_, k) => index * 5 + k + 1),
            },
          },
        });

        const totalPrice = products.reduce(
          (total: number, product) => total + product.price,
          0,
        );

        await prisma.order.upsert({
          where: { id: index * 5 + i + 1 },
          update: {},
          create: {
            orderCode: nanoid(10),
            customerId: 7,
            sellerId: 1,
            addressId: addresses[0].id,
            totalPrice: totalPrice,
            status: value,
            note: 'This is a note',
            paymentType: 'TRANSFER',
            orderItems: {
              create: products.map((product) => {
                return {
                  productId: product.id,
                  quantity: 1,
                  price: product.price,
                };
              }),
            },
          },
        });
      });
    }),
  ]);
};
