import 'server-only';

import type { ProductSearchIntent } from '@features/ai-product-assistant/model/productSearchIntent';
import type {
  ProductSearchMapping,
  ProductSearchMappingDraft,
} from '@features/ai-product-assistant/model/productSearchMapping';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductSearchCatalog() {
  const categories = await prisma.productCategory.findMany({
    // Match the public category tree: visible roots and their visible children.
    where: {
      isVisible: true,
      OR: [{ parentId: null }, { parent: { parentId: null, isVisible: true } }],
    },
    select: { id: true, slug: true, name_en: true, name_ko: true },
    orderBy: { id: 'asc' },
  });

  if (categories.length === 0) {
    return { categories, filters: [] };
  }

  const filters = await prisma.filter.findMany({
    where: { categoryName: { in: categories.map(({ slug }) => slug) } },
    select: {
      id: true,
      name: true,
      categoryName: true,
      filterOption: {
        select: {
          id: true,
          name_en: true,
          name_ko: true,
          categoryName: true,
          filterId: true,
        },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  });

  return {
    categories,
    filters: filters.map(({ id, name, categoryName, filterOption }) => ({
      id,
      name,
      categoryName,
      options: filterOption
        .filter(
          (option) =>
            option.categoryName === categoryName && option.filterId === id,
        )
        .map(({ id, name_en, name_ko }) => ({ id, name_en, name_ko })),
    })),
  };
}

type ProductSearchCatalog = Awaited<ReturnType<typeof getProductSearchCatalog>>;

function resolveConditions(
  requirements: string[],
  selections: ProductSearchMappingDraft['hardRequirements'],
  filterIdsByOptionId: Map<number, number>,
) {
  const matches = new Map<
    string,
    ProductSearchMapping['hardRequirements'][number]
  >();

  for (const { requirement, filterOptionId } of selections) {
    const filterId = filterIdsByOptionId.get(filterOptionId);
    if (filterId !== undefined && !matches.has(requirement)) {
      matches.set(requirement, { requirement, filterId, filterOptionId });
    }
  }

  const matched: ProductSearchMapping['hardRequirements'] = [];
  const unmatched: string[] = [];

  for (const requirement of requirements) {
    const match = matches.get(requirement);
    if (match) matched.push(match);
    else unmatched.push(requirement);
  }

  return { matched, unmatched };
}

export function resolveProductSearchMapping(
  intent: ProductSearchIntent,
  draft: ProductSearchMappingDraft,
  catalog: ProductSearchCatalog,
): ProductSearchMapping {
  const category =
    intent.categoryHint === null
      ? undefined
      : catalog.categories.find(({ id }) => id === draft.categoryId);
  const filterIdsByOptionId = new Map<number, number>();

  for (const filter of catalog.filters) {
    if (filter.categoryName !== category?.slug) continue;
    for (const option of filter.options) {
      filterIdsByOptionId.set(option.id, filter.id);
    }
  }

  const hardRequirements = resolveConditions(
    intent.hardRequirements,
    draft.hardRequirements,
    filterIdsByOptionId,
  );
  const preferences = resolveConditions(
    intent.preferences,
    draft.preferences,
    filterIdsByOptionId,
  );

  return {
    category: category ? { id: category.id, slug: category.slug } : null,
    hardRequirements: hardRequirements.matched,
    preferences: preferences.matched,
    unmatchedHardRequirements: hardRequirements.unmatched,
    unmatchedPreferences: preferences.unmatched,
  };
}
