import './load-env';

import { PrismaClient } from '@prisma/client';

import { createHomeSection } from './create/create-home-section';

const prisma = new PrismaClient();

async function seedHomeSection() {
  await createHomeSection();
}

seedHomeSection()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Home section seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
