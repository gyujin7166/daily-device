import 'server-only';

import type { HomeSection } from '@entities/home/model/types';

import {
  getCategoryHref,
  getProductHref,
} from '@shared/lib/routes/productRoutes';

import prisma from 'prisma/prismaClientSingleton';

type GetHomeSectionsOptions = {
  keys?: string[];
};

export async function getHomeSections({
  keys,
}: GetHomeSectionsOptions = {}): Promise<HomeSection[]> {
  const sections = await prisma.homeSection.findMany({
    where: {
      isVisible: true,
      ...(keys && keys.length > 0 ? { key: { in: keys } } : {}),
    },
    select: {
      id: true,
      key: true,
      eyebrow: true,
      title: true,
      subtitle: true,
      displayOrder: true,
      items: {
        where: { isVisible: true },
        select: {
          id: true,
          label: true,
          title: true,
          description: true,
          cta: true,
          href: true,
          targetCategory: {
            select: {
              slug: true,
            },
          },
          targetProduct: {
            select: {
              slug: true,
              category: {
                select: {
                  slug: true,
                },
              },
            },
          },
          image_url: true,
          imageAlt: true,
          displayOrder: true,
          layoutGroup: true,
          layoutGroupClassName: true,
          layoutAreaClassName: true,
          labelPosition: true,
          imageClassName: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
  });

  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const href =
        item.targetProduct && item.targetProduct.category
          ? getProductHref({
              categorySlug: item.targetProduct.category.slug,
              productSlug: item.targetProduct.slug,
            })
          : item.targetCategory
            ? getCategoryHref(item.targetCategory.slug)
            : item.href;

      return {
        id: item.id,
        label: item.label,
        title: item.title,
        description: item.description,
        cta: item.cta,
        href,
        image_url: item.image_url,
        imageAlt: item.imageAlt,
        displayOrder: item.displayOrder,
        layoutGroup: item.layoutGroup,
        layoutGroupClassName: item.layoutGroupClassName,
        layoutAreaClassName: item.layoutAreaClassName,
        labelPosition: item.labelPosition,
        imageClassName: item.imageClassName,
      };
    }),
  }));
}
