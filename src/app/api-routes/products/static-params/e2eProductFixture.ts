import type { PrismaClient } from '@prisma/client';

export type E2EProductFixture = {
  categorySlug: string;
  productSlug: string;
};

export const E2E_PRODUCT_FIXTURE_ERROR_MESSAGE =
  'E2E requires a visible product with test-ready catalog data.';

export async function findE2EProductFixture(
  prismaClient: Pick<PrismaClient, 'product'>,
): Promise<E2EProductFixture | null> {
  const product = await prismaClient.product.findFirst({
    where: {
      category: {
        isVisible: true,
        translations: {
          some: {
            locale: 'ko',
          },
        },
      },
      ProductImage: {
        some: {
          isMain: true,
        },
      },
      productColor: {
        some: {
          isDefault: true,
        },
      },
      AND: [
        {
          translations: {
            some: {
              locale: 'ko',
            },
          },
        },
        {
          translations: {
            some: {
              locale: 'en',
            },
          },
        },
        {
          category: {
            translations: {
              some: {
                locale: 'en',
              },
            },
          },
        },
      ],
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    categorySlug: product.category.slug,
    productSlug: product.slug,
  };
}

export async function getRequiredE2EProductFixture(
  prismaClient: Pick<PrismaClient, 'product'>,
) {
  const fixture = await findE2EProductFixture(prismaClient);

  if (!fixture) {
    throw new Error(E2E_PRODUCT_FIXTURE_ERROR_MESSAGE);
  }

  return fixture;
}
