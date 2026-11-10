import 'server-only';

import type { ProductSearchCandidate } from '@features/ai-product-assistant/model/productSearchCandidate';
import type { ProductSearchIntent } from '@features/ai-product-assistant/model/productSearchIntent';
import type {
  ProductSearchMapping,
  ProductSearchMappingDraft,
} from '@features/ai-product-assistant/model/productSearchMapping';

import type { Locale } from '@shared/config/i18n/routing';

import prisma from 'prisma/prismaClientSingleton';

import { getProductsPage } from '../../products/service';

const MAX_PRODUCT_CANDIDATES = 12;

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

export async function getProductSearchCandidates(
  { category, hardRequirements, preferences }: ProductSearchMapping,
  { min, max, currency }: ProductSearchIntent['priceRange'],
  locale: Locale,
): Promise<ProductSearchCandidate[]> {
  if (!category) return [];

  // Fetch the full narrowed set before checking exact options, sale prices and preferences.
  const { items } = await getProductsPage(
    category.slug,
    undefined,
    undefined,
    'relevance',
    hardRequirements.map(({ filterOptionId }) => String(filterOptionId)),
    {},
    {},
    {},
    locale,
  );

  const candidates: ProductSearchCandidate[] = [];
  for (const product of items) {
    if (product.category.id !== category.id || !product.category.isVisible)
      continue;

    const hasOption = ({
      filterId,
      filterOptionId,
    }: ProductSearchMapping['hardRequirements'][number]) =>
      product.filter.some((group) => group[filterId]?.includes(filterOptionId));

    if (!hardRequirements.every(hasOption)) continue;

    const { discountedPrice } = product;
    if (
      currency === 'KRW' &&
      ((min !== null && discountedPrice < min) ||
        (max !== null && discountedPrice > max))
    )
      continue;

    const matchedPreferences = preferences
      .filter(hasOption)
      .map(({ requirement }) => requirement);
    candidates.push({
      id: product.id,
      name: product.name_en, // The catalog service places the localized name here.
      slug: product.slug,
      description: product.description,
      categorySlug: product.category.slug,
      originalPrice: product.originalPrice,
      discountedPrice,
      discountRate: product.discountRate,
      matchedPreferences: [...new Set(matchedPreferences)],
    });
  }

  return candidates
    .sort(
      (left, right) =>
        right.matchedPreferences.length - left.matchedPreferences.length ||
        left.id - right.id,
    )
    .slice(0, MAX_PRODUCT_CANDIDATES);
}
