import './load-env';

import { PrismaClient } from '@prisma/client';

import { createColor } from './create/create-color';
import { createFilter } from './create/create-filter';
import { createFilterOption } from './create/create-filter-option';
import { createHero } from './create/create-hero';
import { createHeroType } from './create/create-hero-type';
import { createHomeSection } from './create/create-home-section';
import { createProductCategory } from './create/create-product-category';
import { createProductColor } from './create/create-product-color';
import { createProductDetail } from './create/create-product-detail';
import { createProductFilterOption } from './create/create-product-filter-option';
import { createProductImages } from './create/create-product-image';
import { createProducts } from './create/create-products';
import { createRecommend } from './create/create-recommend';

const prisma = new PrismaClient();

async function seedCatalogBase() {
  await createRecommend();
  await createProductCategory();
  await createHeroType();
  await createHero();
}

async function seedFilters() {
  await createFilter();
  await createFilterOption();
}

async function seedProducts() {
  await createColor();
  await createProducts();
  await createProductColor();
  await createProductImages();
  await createProductDetail();
  await createProductFilterOption();
}

async function seeds() {
  await seedCatalogBase();
  await seedFilters();
  await seedProducts();
  await createHomeSection();
}

seeds()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
