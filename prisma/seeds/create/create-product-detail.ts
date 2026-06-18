import { PrismaClient } from '@prisma/client';

import { portfolioProducts } from '../data/portfolio-catalog';

const prisma = new PrismaClient();

export async function createProductDetail() {
  try {
    const products = await prisma.product.findMany({
      where: {
        name_en: { in: portfolioProducts.map((product) => product.name_en) },
      },
      select: { id: true, name_en: true },
    });
    const productMap = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.name_en] = product.id;
        return acc;
      },
      {},
    );
    const productIds = products.map((product) => product.id);
    await prisma.productDetail.deleteMany({
      where: { productId: { in: productIds } },
    });

    const productDetails = portfolioProducts.flatMap((product) => {
      const productId = productMap[product.name_en];

      if (!productId) {
        throw new Error(`Product not found: ${product.name_en}`);
      }

      return product.details.map((detail) => ({
        productId,
        titleId: detail.titleId,
        title_middle: detail.title_middle,
        title_sub: detail.title_sub,
        specification: detail.specification
          ? JSON.stringify(detail.specification)
          : null,
        note: detail.note,
      }));
    });

    const res = await prisma.productDetail.createMany({
      data: productDetails,
    });

    console.log('Synced ProductDetails: ', res);
  } catch (error) {
    console.log('Create ProductDetails failed!: ', error);
    throw error;
  }
}
