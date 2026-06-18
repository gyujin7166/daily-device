import { PrismaClient } from '@prisma/client';

import { filterCatalog } from '../data/filter-catalog';

const prisma = new PrismaClient();

type FilterOptionSeed = {
  filterName: string;
  categoryName: string;
  name_ko: string;
  name_en: string;
};

const getFilterKey = (categoryName: string, filterName: string) =>
  `${categoryName}:${filterName}`;

const filterOptionSeeds: FilterOptionSeed[] = filterCatalog.flatMap(
  (category) =>
    category.filters.flatMap((filter) =>
      filter.options.map((option) => ({
        filterName: filter.name,
        categoryName: category.categoryName,
        name_ko: option.name_ko,
        name_en: option.name_en,
      })),
    ),
);

export async function createFilterOption() {
  try {
    const filters = await prisma.filter.findMany({
      select: { id: true, name: true, categoryName: true },
    });
    const filterMap = filters.reduce<Record<string, number>>((acc, filter) => {
      acc[getFilterKey(filter.categoryName, filter.name)] = filter.id;
      return acc;
    }, {});
    const filterOptions = filterOptionSeeds.map((option) => {
      const filterId =
        filterMap[getFilterKey(option.categoryName, option.filterName)];

      if (!filterId) {
        throw new Error(
          `Filter not found: ${option.categoryName}/${option.filterName}`,
        );
      }

      return {
        name_ko: option.name_ko,
        name_en: option.name_en,
        categoryName: option.categoryName,
        filterId,
      };
    });

    const res = await prisma.filterOption.createMany({
      data: filterOptions,
    });

    console.log('Synced FilterOption: ', res);
  } catch (error) {
    console.log('Create FilterOption failed!: ', error);
    throw error;
  }
}
