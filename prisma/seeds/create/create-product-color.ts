import { PrismaClient } from '@prisma/client';

import { portfolioProducts } from '../data/portfolio-catalog';
import { readSeedImageManifest } from '../data/seed-image-manifest-utils';

const prisma = new PrismaClient();

export async function createProductColor() {
  try {
    const seedImageManifest = readSeedImageManifest();
    const [colors, products] = await Promise.all([
      prisma.color.findMany({ select: { id: true, name: true } }),
      prisma.product.findMany({
        where: {
          slug: { in: portfolioProducts.map((product) => product.slug) },
        },
        select: { id: true, name_en: true, slug: true },
      }),
    ]);
    const colorMap = colors.reduce<Record<string, number>>((acc, color) => {
      acc[color.name] = color.id;
      return acc;
    }, {});
    const productMap = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.name_en] = product.id;
        return acc;
      },
      {},
    );
    const productMapBySlug = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.slug] = product.id;
        return acc;
      },
      {},
    );
    const productIds = products.map((product) => product.id);
    await prisma.productColor.deleteMany({
      where: { productId: { in: productIds } },
    });

    const productColors = seedImageManifest
      ? Array.from(
          seedImageManifest.products.reduce<Map<string, string[]>>(
            (acc, product) => {
              if (!product.colorName) {
                return acc;
              }

              const colorNames = acc.get(product.productSlug) ?? [];

              if (!colorNames.includes(product.colorName)) {
                acc.set(product.productSlug, [
                  ...colorNames,
                  product.colorName,
                ]);
              }

              return acc;
            },
            new Map<string, string[]>(),
          ),
        ).flatMap(([productSlug, colorNames]) => {
          const productId = productMapBySlug[productSlug];

          if (!productId) {
            throw new Error(`Product not found: ${productSlug}`);
          }

          return colorNames.map((colorName, index) => {
            const colorId = colorMap[colorName];

            if (!colorId) {
              throw new Error(`Color not found: ${colorName}`);
            }

            return { productId, colorId, isDefault: index === 0 };
          });
        })
      : portfolioProducts.flatMap((product) => {
          const productId = productMap[product.name_en];

          if (!productId) {
            throw new Error(`Product not found: ${product.name_en}`);
          }

          return product.colors.map((colorName, index) => {
            const colorId = colorMap[colorName];

            if (!colorId) {
              throw new Error(`Color not found: ${colorName}`);
            }

            return { productId, colorId, isDefault: index === 0 };
          });
        });

    if (productColors.length === 0) {
      console.log('Synced ProductColor: 0');
      return;
    }

    const res = await prisma.productColor.createMany({
      data: productColors,
      skipDuplicates: true,
    });

    console.log('Synced ProductColor: ', res);
  } catch (error) {
    console.log('Create ProductColor failed!: ', error);
    throw error;
  }
}
