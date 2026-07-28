import 'server-only';

import prisma from 'prisma/prismaClientSingleton';

import { getRequiredE2EProductFixture } from './e2eProductFixture';

export async function getStaticProductCategoryParams() {
  if (process.env.E2E_BUILD === 'true') {
    const fixture = await getRequiredE2EProductFixture(prisma);

    return [{ category: fixture.categorySlug }];
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
    const fixture = await getRequiredE2EProductFixture(prisma);

    return [
      {
        category: fixture.categorySlug,
        slug: fixture.productSlug,
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
