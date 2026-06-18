import { PrismaClient } from '@prisma/client';

import { filterCatalog } from '../data/filter-catalog';

const prisma = new PrismaClient();

const filterSeeds = filterCatalog.flatMap((category) =>
  category.filters.map((filter) => ({
    name: filter.name,
    categoryName: category.categoryName,
  })),
);

export async function createFilter() {
  try {
    await prisma.productFilterOption.deleteMany();
    await prisma.filterOption.deleteMany();
    await prisma.filter.deleteMany();

    const res = await prisma.filter.createMany({
      data: filterSeeds,
    });

    console.log('Synced Filter: ', res);
  } catch (error) {
    console.log('Create Filter failed!: ', error);
    throw error;
  }
}
