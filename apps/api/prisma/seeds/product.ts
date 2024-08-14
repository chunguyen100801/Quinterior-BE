import { PrismaClient } from '@prisma/db-api';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createProducts = async () => {
  console.log('Seeding products...');
  for (let i = 0; i < 30; i++) {
    await prisma.product.upsert({
      where: { id: i + 1 },
      update: {
        model: {
          update: {
            url: 'https://datn-be.s3.amazonaws.com/products/model/a3d3b9cc-5d96-47de-a32c-976a2b6c7176',
          },
        },
      },
      create: {
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        price: parseInt(
          faker.commerce.price({ min: 10000, max: 100000, dec: 0 }),
          10,
        ),
        quantity: faker.number.int({ min: 5, max: 20 }),
        background: '#f5f5f5',
        thumbnail: faker.image.urlLoremFlickr({ category: 'food' }),
        images: Array.from({ length: 4 }).map(() =>
          faker.image.urlLoremFlickr({ category: 'food' }),
        ),
        model: {
          create: {
            x: faker.number.int({ min: 10, max: 100 }),
            y: faker.number.int({ min: 10, max: 100 }),
            z: faker.number.int({ min: 10, max: 100 }),
            url: 'https://datn-be.s3.amazonaws.com/products/model/a3d3b9cc-5d96-47de-a32c-976a2b6c7176',
            type: 'FLOOR_ITEM',
          },
        },
        seller: {
          connect: {
            id: 1,
          },
        },
        categories: {
          connect: {
            id: faker.number.int({ min: 1, max: 5 }),
          },
        },
      },
    });
  }
};
