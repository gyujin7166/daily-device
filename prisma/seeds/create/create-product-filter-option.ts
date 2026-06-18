import { PrismaClient } from '@prisma/client';

import { portfolioProducts } from '../data/portfolio-catalog';

const prisma = new PrismaClient();

const getFilterOptionKey = (categoryName: string, nameEn: string) =>
  `${categoryName}:${nameEn}`;

export async function createProductFilterOption() {
  try {
    const [products, filterOptions] = await Promise.all([
      prisma.product.findMany({
        where: {
          name_en: { in: portfolioProducts.map((product) => product.name_en) },
        },
        select: { id: true, name_en: true },
      }),
      prisma.filterOption.findMany({
        select: { id: true, name_en: true, categoryName: true },
      }),
    ]);
    const productMap = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.name_en] = product.id;
        return acc;
      },
      {},
    );
    const filterOptionMap = filterOptions.reduce<Record<string, number>>(
      (acc, option) => {
        acc[getFilterOptionKey(option.categoryName, option.name_en)] =
          option.id;
        return acc;
      },
      {},
    );
    const productIds = products.map((product) => product.id);
    await prisma.productFilterOption.deleteMany({
      where: { productId: { in: productIds } },
    });

    const productFilterOptions = portfolioProducts.flatMap((product) => {
      const productId = productMap[product.name_en];

      if (!productId) {
        throw new Error(`Product not found: ${product.name_en}`);
      }

      return product.filterOptions.map((filterOptionName) => {
        const filterOptionId =
          filterOptionMap[
            getFilterOptionKey(product.categoryName, filterOptionName)
          ];

        if (!filterOptionId) {
          throw new Error(
            `FilterOption not found: ${product.categoryName}/${filterOptionName}`,
          );
        }

        return { productId, filterOptionId };
      });
    });

    const res = await prisma.productFilterOption.createMany({
      data: productFilterOptions,
    });

    console.log('Synced ProductFilterOption: ', res);
  } catch (error) {
    console.log('Create ProductFilterOption failed!: ', error);
    throw error;
  }
}
