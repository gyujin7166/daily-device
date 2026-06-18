import './load-env';

import { PrismaClient } from '@prisma/client';

import { createHero } from './create/create-hero';
import { createHeroType } from './create/create-hero-type';

const prisma = new PrismaClient();

async function seedHero() {
  await createHeroType();
  await createHero();
}

seedHero()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Hero seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
