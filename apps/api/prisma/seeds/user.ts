import { PrismaClient, UserRole } from '@prisma/db-api';
import { generateHash } from '../../src/utils';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createUser = async () => {
  console.log('Seeding users ...');
  await prisma.user.upsert({
    where: { email: 'quanghuynh@gmail.com' },
    update: {},
    create: {
      email: 'quanghuynh@gmail.com',
      password: generateHash('password'),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: '0914894337',
      avatar: faker.image.avatar(),
      isActive: true,
      role: UserRole.ADMIN,
      cart: {
        create: {},
      },
      seller: {
        create: {
          name: 'Nguyễn Văn Anh',
        },
      },
    },
  });
};
