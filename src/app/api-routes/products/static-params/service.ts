import 'server-only';

import prisma from 'prisma/prismaClientSingleton';

const E2E_PRODUCT_CATEGORY = 'mice';
const E2E_PRODUCT_SLUG = 'aster-mouse-mini';

export async function getStaticProductCategoryParams() {
  if (process.env.E2E_BUILD === 'true') {
    return [{ category: E2E_PRODUCT_CATEGORY }];
  }

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
  if (process.env.E2E_BUILD === 'true') {
    return [
      {
        category: E2E_PRODUCT_CATEGORY,
        slug: E2E_PRODUCT_SLUG,
      },
    ];
  }

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
