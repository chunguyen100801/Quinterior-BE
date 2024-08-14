import { PrismaClient } from '@prisma/db-api';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createAddresses = async () => {
  console.log('Seeding addresses...');
  const addresses1 = await prisma.address.findMany({
    where: {
      userId: 1,
    },
  });

  if (addresses1.length === 0) {
    await prisma.address.create({
      data: {
        userId: 1,
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        fullName: faker.person.fullName(),
      },
    });
  }

  const addresses2 = await prisma.address.findMany({
    where: {
      userId: 7,
    },
  });

  if (addresses2.length > 0) {
    await prisma.address.create({
      data: {
        userId: 7,
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        fullName: faker.person.fullName(),
      },
    });
  }
};
