import 'server-only';

import type { SearchSuggestionItem } from '@features/search/model/types';

import { escapeRegExp } from '@shared/lib/utils/escapeRegExp';
import { normalizeSearchTerm } from '@shared/lib/utils/normalizeSearchText';

import prisma from 'prisma/prismaClientSingleton';

export async function getSearchSuggestionsByKeyword(
  keyword: string,
): Promise<SearchSuggestionItem[]> {
  if (!keyword.trim()) {
    return [];
  }

  const normalizedKeyword = escapeRegExp(normalizeSearchTerm(keyword));

  return prisma.product.findMany({
    where: {
      OR: [
        { name_en: { contains: normalizedKeyword } },
        { name_ko: { contains: normalizedKeyword } },
        {
          AND: normalizedKeyword.split(' ').map((term) => ({
            OR: [
              { name_en: { contains: term } },
              { name_ko: { contains: term } },
            ],
          })),
        },
      ],
    },
    select: {
      id: true,
      name_en: true,
      slug: true,
      name_ko: true,
    },
    take: 10,
  });
}
