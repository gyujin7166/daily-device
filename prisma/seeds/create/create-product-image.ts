import { PrismaClient } from '@prisma/client';

import { portfolioProducts } from '../data/portfolio-catalog';
import { readSeedImageManifest } from '../data/seed-image-manifest-utils';

const prisma = new PrismaClient();

export async function createProductImages() {
  try {
    const seedImageManifest = readSeedImageManifest();
    const productSlugs = portfolioProducts.map((product) => product.slug);
    const products = await prisma.product.findMany({
      where: { slug: { in: productSlugs } },
      select: {
        id: true,
        name_en: true,
        slug: true,
        productColor: {
          select: {
            id: true,
            color: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    const productMapByName = products.reduce<Record<string, number>>(
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
    const productColorMapByName = products.reduce<Record<string, number>>(
      (acc, product) => {
        product.productColor.forEach((productColor) => {
          acc[`${product.name_en}:${productColor.color.name}`] =
            productColor.id;
        });
        return acc;
      },
      {},
    );
    const productColorMapBySlug = products.reduce<Record<string, number>>(
      (acc, product) => {
        product.productColor.forEach((productColor) => {
          acc[`${product.slug}:${productColor.color.name}`] = productColor.id;
        });
        return acc;
      },
      {},
    );
    const productIds = products.map((product) => product.id);
    await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });

    const productImages = seedImageManifest
      ? seedImageManifest.products.flatMap((product) => {
          const productId = productMapBySlug[product.productSlug];

          if (!productId) {
            throw new Error(`Product not found: ${product.productSlug}`);
          }

          const normalizedColorName = product.colorName?.trim();
          const productColorId = normalizedColorName
            ? productColorMapBySlug[
                `${product.productSlug}:${normalizedColorName}`
              ]
            : null;

          if (normalizedColorName && !productColorId) {
            throw new Error(
              `ProductColor not found: ${product.productSlug}/${normalizedColorName}`,
            );
          }

          return product.images.map((image) => ({
            productId,
            productColorId,
            image_url: image.secureUrl.trim(),
            order: image.order,
            isMain: image.isMain,
          }));
        })
      : portfolioProducts.flatMap((product) => {
          const productId = productMapByName[product.name_en];

          if (!productId) {
            throw new Error(`Product not found: ${product.name_en}`);
          }

          return product.images
            .filter((image) => image.image_url.trim().length > 0)
            .map(({ image_url, order, isMain, colorName }) => {
              const normalizedColorName = colorName?.trim();
              const productColorId = normalizedColorName
                ? productColorMapByName[
                    `${product.name_en}:${normalizedColorName}`
                  ]
                : null;

              if (normalizedColorName && !productColorId) {
                throw new Error(
                  `ProductColor not found: ${product.name_en}/${normalizedColorName}`,
                );
              }

              return {
                productId,
                productColorId,
                image_url: image_url.trim(),
                order,
                isMain,
              };
            });
        });

    if (productImages.length === 0) {
      console.log('Synced ProductImages: 0');
      return;
    }

    const res = await prisma.productImage.createMany({
      data: productImages,
    });

    console.log(
      seedImageManifest
        ? 'Synced ProductImages from seed image manifest: '
        : 'Synced ProductImages: ',
      res,
    );
  } catch (error) {
    console.log('Create ProductImages failed!: ', error);
    throw error;
  }
}
