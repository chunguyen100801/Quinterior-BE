import { PrismaClient } from '@prisma/db-api';
import { createUser } from './seeds/user';
import { createProducts } from './seeds/product';
import { createCategories } from './seeds/category';
import { createAddresses } from './seeds/address';
import { createOrders } from './seeds/order';
import { createReviews } from './seeds/review';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await createUser();

  await createAddresses();

  await createCategories();

  await createProducts();

  await createOrders();

  await createReviews();

  console.log(
    `Created seed data for the Prisma schema. You can now start the app and use the API.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
