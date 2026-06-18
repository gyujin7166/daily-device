import { PrismaClient } from '@prisma/client';

import { portfolioProductCategories } from '../data/portfolio-catalog';
import { readSeedImageManifest } from '../data/seed-image-manifest-utils';

import type { SeedImageManifest } from '../data/seed-image-manifest-utils';

const prisma = new PrismaClient();

const getCategoryImageUrl = (
  manifest: SeedImageManifest | null,
  categorySlug: string,
) =>
  manifest?.categories?.find(
    (category) => category.categorySlug === categorySlug,
  )?.image.secureUrl ?? null;

const toProductCategoryData = (
  category: (typeof portfolioProductCategories)[number],
  manifest: SeedImageManifest | null,
) => ({
  name_en: category.name_en,
  name_ko: category.name_ko,
  slug: category.slug,
  displayOrder: category.displayOrder,
  image_url:
    getCategoryImageUrl(manifest, category.slug) ?? category.image_url ?? null,
  isVisible: category.isVisible ?? true,
});

export async function createProductCategory() {
  try {
    const seedImageManifest = readSeedImageManifest();
    const parentCategories = portfolioProductCategories.filter(
      (category) => category.parentSlug === null,
    );
    const childCategories = portfolioProductCategories.filter(
      (category) => category.parentSlug !== null,
    );

    await Promise.all(
      parentCategories.map((categorySeed) => {
        const category = toProductCategoryData(categorySeed, seedImageManifest);

        return prisma.productCategory.upsert({
          where: { slug: category.slug },
          update: { ...category, parentId: null },
          create: { ...category, parentId: null },
        });
      }),
    );

    const parentRows = await prisma.productCategory.findMany({
      where: {
        slug: {
          in: parentCategories.map((category) => category.slug),
        },
      },
      select: { id: true, slug: true },
    });
    const parentIdBySlug = parentRows.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category.slug] = category.id;
        return acc;
      },
      {},
    );

    await Promise.all(
      childCategories.map((categorySeed) => {
        const category = toProductCategoryData(categorySeed, seedImageManifest);
        const parentId = parentIdBySlug[categorySeed.parentSlug ?? ''];

        if (!parentId) {
          throw new Error(
            `Parent category not found: ${categorySeed.parentSlug}`,
          );
        }

        return prisma.productCategory.upsert({
          where: { slug: category.slug },
          update: { ...category, parentId },
          create: { ...category, parentId },
        });
      }),
    );

    console.log('Synced ProductCategory: ', portfolioProductCategories.length);
  } catch (error) {
    console.log('Create ProductCategory failed!: ', error);
    throw error;
  }
}
