import 'server-only';

import prisma from 'prisma/prismaClientSingleton';

export async function getStaticProductCategoryParams() {
  const categories = await prisma.productCategory.findMany({
    where: {
      isVisible: true,
      product: {
        some: {},
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    select: {
      slug: true,
    },
  });

  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function getStaticProductDetailParams() {
  const products = await prisma.product.findMany({
    orderBy: [{ id: 'asc' }],
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  return products.map((product) => ({
    category: product.category.slug,
    slug: product.slug,
  }));
}
