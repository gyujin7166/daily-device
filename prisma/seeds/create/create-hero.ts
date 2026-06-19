import { PrismaClient } from '@prisma/client';

import { portfolioProductCategories } from '../data/portfolio-catalog';
import { readSeedImageManifest } from '../data/seed-image-manifest-utils';

import type { SeedImageManifest } from '../data/seed-image-manifest-utils';

const prisma = new PrismaClient();

const MAIN_HERO_KEY = 'pixel-keys-flow';
const PRODUCT_ALL_HERO_KEY = 'products';
const PRODUCT_DISCOUNTS_HERO_KEY = 'discounts';
const HERO_IMAGE_WIDTH = 1672;
const HERO_IMAGE_HEIGHT = 941;
const defaultMainHeroImageUrl =
  process.env.SEED_MAIN_HERO_IMAGE_URL ??
  'https://res.cloudinary.com/dmcv5suez/image/upload/v1780017375/ecommerce/heroes/main/main_yblgas.png';

const getHeroTypeKey = (name: string) => name;

const getRequiredCategoryId = (
  categoryMap: Record<string, number>,
  categoryName: string,
) => {
  const categoryId = categoryMap[categoryName];

  if (!categoryId) {
    throw new Error(`Required product category was not found: ${categoryName}`);
  }

  return categoryId;
};

const getHeroImageUrl = ({
  categorySlug,
  heroKey,
  manifest,
  type,
}: {
  categorySlug?: string | null;
  heroKey: string;
  manifest: SeedImageManifest | null;
  type: string;
}) =>
  manifest?.heroes?.find(
    (hero) =>
      hero.heroType === type &&
      hero.heroKey === heroKey &&
      (typeof categorySlug === 'undefined' ||
        hero.categorySlug === categorySlug),
  )?.image.secureUrl ?? null;

export async function createHero() {
  try {
    const seedImageManifest = readSeedImageManifest();
    const heroTypes = await prisma.heroType.findMany({
      select: { id: true, name: true },
    });
    const productCategories = await prisma.productCategory.findMany({
      select: { id: true, name_en: true },
    });
    const heroTypeMap = heroTypes.reduce<Record<string, number>>(
      (acc, heroType) => {
        acc[getHeroTypeKey(heroType.name)] = heroType.id;
        return acc;
      },
      {},
    );
    const categoryMap = productCategories.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category.name_en] = category.id;
        return acc;
      },
      {},
    );
    const mainHeroTypeId = heroTypeMap.main;
    const productHeroTypeId = heroTypeMap.product;
    const productAllHeroTypeId = heroTypeMap['product-all'];
    const productDiscountsHeroTypeId = heroTypeMap['product-discounts'];

    if (
      !mainHeroTypeId ||
      !productHeroTypeId ||
      !productAllHeroTypeId ||
      !productDiscountsHeroTypeId
    ) {
      throw new Error('Required hero type was not found.');
    }

    const productHeroes = portfolioProductCategories
      .filter((category) => category.parentSlug)
      .map((category) => ({
        name_en: category.name_en,
        name_ko: category.name_ko,
        image_url:
          getHeroImageUrl({
            categorySlug: category.slug,
            heroKey: category.slug,
            manifest: seedImageManifest,
            type: 'product',
          }) ??
          category.hero_image_url ??
          category.image_url ??
          null,
        image_width: HERO_IMAGE_WIDTH,
        image_height: HERO_IMAGE_HEIGHT,
        description: `${category.name_ko} 제품을 둘러보세요.`,
        detailed_description: null,
        position: 'center',
        isDefault: true,
        textTone: 'dark',
        navTone: 'light',
        overlayTone: 'none',
        heroTypeId: productHeroTypeId,
        targetCategoryId: getRequiredCategoryId(categoryMap, category.name_en),
      }));

    const heroes = [
      {
        name_en: 'workspace collection',
        name_ko: '데스크 셋업 컬렉션',
        image_url:
          getHeroImageUrl({
            heroKey: MAIN_HERO_KEY,
            manifest: seedImageManifest,
            type: 'main',
          }) ?? defaultMainHeroImageUrl,
        image_width: HERO_IMAGE_WIDTH,
        image_height: HERO_IMAGE_HEIGHT,
        description: '집중을 돕는 데스크 셋업',
        detailed_description:
          '가상 생산성 기기 컬렉션으로 완성하는 조용하고 정돈된 작업 공간.',
        position: 'center',
        isDefault: true,
        textTone: 'light',
        navTone: 'light',
        overlayTone: 'dark',
        heroTypeId: mainHeroTypeId,
        targetCategoryId: null,
      },
      {
        name_en: 'products',
        name_ko: '전체 상품',
        image_url:
          getHeroImageUrl({
            heroKey: PRODUCT_ALL_HERO_KEY,
            manifest: seedImageManifest,
            type: 'product-all',
          }) ??
          process.env.SEED_PRODUCT_ALL_HERO_IMAGE_URL ??
          null,
        image_width: HERO_IMAGE_WIDTH,
        image_height: HERO_IMAGE_HEIGHT,
        description:
          '마우스, 키보드, 헤드셋부터 액세서리까지 Daily Device의 대표 상품을 한곳에서 확인해보세요.',
        detailed_description: null,
        position: 'center',
        isDefault: true,
        textTone: 'dark',
        navTone: 'light',
        overlayTone: 'none',
        heroTypeId: productAllHeroTypeId,
        targetCategoryId: null,
      },
      {
        name_en: 'discounts',
        name_ko: '특가 상품',
        image_url:
          getHeroImageUrl({
            heroKey: PRODUCT_DISCOUNTS_HERO_KEY,
            manifest: seedImageManifest,
            type: 'product-discounts',
          }) ??
          process.env.SEED_PRODUCT_DISCOUNTS_HERO_IMAGE_URL ??
          getHeroImageUrl({
            heroKey: PRODUCT_ALL_HERO_KEY,
            manifest: seedImageManifest,
            type: 'product-all',
          }) ??
          process.env.SEED_PRODUCT_ALL_HERO_IMAGE_URL ??
          null,
        image_width: HERO_IMAGE_WIDTH,
        image_height: HERO_IMAGE_HEIGHT,
        description:
          '지금 할인 중인 Daily Device 제품을 한곳에서 확인하고 필요한 기기를 더 합리적으로 만나보세요.',
        detailed_description: null,
        position: 'center',
        isDefault: true,
        textTone: 'dark',
        navTone: 'light',
        overlayTone: 'none',
        heroTypeId: productDiscountsHeroTypeId,
        targetCategoryId: null,
      },
      ...productHeroes,
    ];

    await prisma.hero.deleteMany();

    const res = await prisma.hero.createMany({
      data: heroes,
    });

    console.log('Synced Hero: ', res);
  } catch (error) {
    console.log('Create Hero failed!: ', error);
    throw error;
  }
}
