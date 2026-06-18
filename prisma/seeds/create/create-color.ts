import { PrismaClient } from '@prisma/client';

import { portfolioColors } from '../data/portfolio-catalog';

const prisma = new PrismaClient();

export async function createColor() {
  try {
    await Promise.all(
      portfolioColors.map((color) =>
        prisma.color.upsert({
          where: { name: color.name },
          update: color,
          create: color,
        }),
      ),
    );

    console.log('Synced Color: ', portfolioColors.length);
  } catch (error) {
    console.log('Create Color failed!: ', error);
    throw error;
  }
}
