import { PrismaClient } from '@prisma/db-api';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createCategories = async () => {
  console.log('Seeding categories...');
  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.department() + i;
    await prisma.category.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        name: name,
        description: faker.commerce.productDescription(),
        sellerId: 1,
      },
    });
  }
};
