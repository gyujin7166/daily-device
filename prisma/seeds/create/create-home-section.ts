import { PrismaClient } from '@prisma/client';

import { homeSections } from '../data/home-catalog';
import { readSeedImageManifest } from '../data/seed-image-manifest-utils';

import type { HomeSectionItemSeed } from '../data/home-section-items';
import type { SeedImageManifest } from '../data/seed-image-manifest-utils';

const prisma = new PrismaClient();

const getOptionalId = (
  map: Map<string, number>,
  key: string | undefined,
  type: string,
) => {
  if (!key) {
    return null;
  }

  const id = map.get(key);

  if (!id) {
    throw new Error(`Required home section ${type} was not found: ${key}`);
  }

  return id;
};

const getHomeSectionItemImageUrl = ({
  manifest,
  sectionKey,
  item,
  categoryImageUrlMap,
}: {
  manifest: SeedImageManifest | null;
  sectionKey: string;
  item: HomeSectionItemSeed;
  categoryImageUrlMap: Map<string, string | null>;
}) =>
  manifest?.homeItems?.find(
    (manifestItem) =>
      manifestItem.sectionKey === sectionKey &&
      manifestItem.itemKey === item.itemKey,
  )?.image.secureUrl ??
  item.image_url ??
  (item.targetCategorySlug
    ? (categoryImageUrlMap.get(item.targetCategorySlug) ?? null)
    : null) ??
  '';

export async function createHomeSection() {
  try {
    const seedImageManifest = readSeedImageManifest();
    const [categories, products] = await Promise.all([
      prisma.productCategory.findMany({
        select: { id: true, slug: true, image_url: true },
      }),
      prisma.product.findMany({
        select: { id: true, slug: true },
      }),
    ]);
    const categoryIdMap = new Map(
      categories.map((category) => [category.slug, category.id]),
    );
    const categoryImageUrlMap = new Map(
      categories.map((category) => [category.slug, category.image_url]),
    );
    const productIdMap = new Map(
      products.map((product) => [product.slug, product.id]),
    );
    const sectionPayloads = homeSections.map((section) => ({
      key: section.key,
      eyebrow: section.eyebrow ?? null,
      title: section.title,
      subtitle: section.subtitle ?? null,
      displayOrder: section.displayOrder,
      items: section.items.map((item) => ({
        label: item.label ?? null,
        title: item.title,
        description: item.description ?? null,
        cta: item.cta ?? null,
        href: item.href ?? null,
        targetCategoryId: getOptionalId(
          categoryIdMap,
          item.targetCategorySlug,
          'category',
        ),
        targetProductId: getOptionalId(
          productIdMap,
          item.targetProductSlug,
          'product',
        ),
        image_url: getHomeSectionItemImageUrl({
          manifest: seedImageManifest,
          sectionKey: section.key,
          item,
          categoryImageUrlMap,
        }),
        imageAlt: item.imageAlt ?? null,
        displayOrder: item.displayOrder,
        layoutGroup: item.layoutGroup ?? 0,
        layoutGroupClassName: item.layoutGroupClassName ?? null,
        layoutAreaClassName: item.layoutAreaClassName ?? null,
        labelPosition: item.labelPosition ?? null,
        imageClassName: item.imageClassName ?? null,
      })),
    }));

    await prisma.homeSectionItem.deleteMany();
    await prisma.homeSection.deleteMany();

    for (const section of sectionPayloads) {
      await prisma.homeSection.create({
        data: {
          key: section.key,
          eyebrow: section.eyebrow,
          title: section.title,
          subtitle: section.subtitle,
          displayOrder: section.displayOrder,
          items: {
            create: section.items,
          },
        },
      });
    }

    console.log('Synced HomeSections: ', homeSections.length);
  } catch (error) {
    console.log('Create HomeSections failed!: ', error);
    throw error;
  }
}
