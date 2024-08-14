import { OrderStatus, PrismaClient } from '@prisma/db-api';

const prisma = new PrismaClient();

export const createReviews = async () => {
  console.log('Seeding reviews...');
  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.RECEIVED,
    },
    include: {
      orderItems: true,
    },
  });

  await Promise.all([
    orders.map(async (order) => {
      await Promise.all([
        order.orderItems.map(async (orderItem) => {
          if (orderItem.id % 2 == 0) {
            await prisma.review.create({
              data: {
                creatorId: 7,
                orderItemId: orderItem.id,
                rating: 3,
                reply: 'This is reply from seller',
              },
            });
          } else {
            await prisma.review.create({
              data: {
                creatorId: 7,
                orderItemId: orderItem.id,
                rating: 3,
                reply: 'This is reply from seller',
              },
            });
          }
        }),
      ]);
    }),
  ]);
};
