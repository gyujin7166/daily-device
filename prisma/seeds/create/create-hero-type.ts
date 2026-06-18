import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const heroTypes = [
  { name: 'main' },
  { name: 'product' },
  { name: 'product-all' },
  { name: 'product-discounts' },
];

export async function createHeroType() {
  try {
    await prisma.hero.deleteMany({
      where: {
        heroType: { name: 'profile' },
      },
    });
    await prisma.heroType.deleteMany({
      where: { name: 'profile' },
    });

    await Promise.all(
      heroTypes.map((heroType) =>
        prisma.heroType.upsert({
          where: { name: heroType.name },
          update: heroType,
          create: heroType,
        }),
      ),
    );

    console.log('Synced HeroTypes: ', heroTypes.length);
  } catch (error) {
    console.log('Create HeroTypes failed!: ', error);
    throw error;
  }
}
