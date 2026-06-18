import { PrismaClient } from '@prisma/client';

import { portfolioProducts } from '../data/portfolio-catalog';

const prisma = new PrismaClient();

const getRequiredId = (
  map: Record<string, number>,
  key: string,
  label: string,
) => {
  const id = map[key];

  if (!id) {
    throw new Error(`${label} not found: ${key}`);
  }

  return id;
};

export async function createProducts() {
  try {
    const categories = await prisma.productCategory.findMany({
      select: { id: true, name_en: true },
    });
    const categoryMap = categories.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category.name_en] = category.id;
        return acc;
      },
      {},
    );

    for (const product of portfolioProducts) {
      const categoryId = getRequiredId(
        categoryMap,
        product.categoryName,
        'ProductCategory',
      );
      const data = {
        name_en: product.name_en,
        name_ko: product.name_ko,
        slug: product.slug,
        search_keyword: product.search_keyword,
        description: product.description,
        detailed_description: product.detailed_description,
        note: product.note,
        price: product.price,
        discountRate: product.discountRate ?? 0,
        productLine: product.productLine,
        categoryId,
      };

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: data,
        create: data,
      });
    }

    console.log('Synced Products: ', portfolioProducts.length);
  } catch (error) {
    console.log('Create Products failed!: ', error);
    throw error;
  }
}
