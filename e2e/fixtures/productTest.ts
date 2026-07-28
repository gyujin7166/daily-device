import { expect, test as base } from '@playwright/test';

import prisma from '../../prisma/prismaClientSingleton';
import { getRequiredE2EProductFixture } from '../../src/app/api-routes/products/static-params/e2eProductFixture';

import type { E2EProductFixture } from '../../src/app/api-routes/products/static-params/e2eProductFixture';

type ProductFixtures = {
  e2eProduct: E2EProductFixture;
};

export const test = base.extend<ProductFixtures>({
  e2eProduct: async ({}, provide) => {
    const product = await getRequiredE2EProductFixture(prisma);

    await provide(product);
  },
});

export { expect };
