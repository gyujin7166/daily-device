import './load-env';

import { PrismaClient } from '@prisma/client';

import { createProductCategory } from './create/create-product-category';

const prisma = new PrismaClient();

async function seedProductCategory() {
  await createProductCategory();
}

seedProductCategory()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Product category seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
