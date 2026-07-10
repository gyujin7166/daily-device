import 'server-only';

import type { ProductDetailResponse } from '@entities/product/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';
import { getProductPriceInfo } from '@shared/lib/price/discount';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductDetailBySlug(
  slug: string,
  localeValue?: string,
): Promise<ProductDetailResponse> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const [rawProduct, productDetails] = await Promise.all([
    prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        productLine: true,
        name_en: true,
        slug: true,
        description: true,
        detailed_description: true,
        translations: {
          where: { locale: { in: localeFallbacks } },
          select: {
            locale: true,
            name: true,
            description: true,
            detailed_description: true,
          },
        },
        price: true,
        discountRate: true,
        productColor: {
          orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
          select: {
            id: true,
            isDefault: true,
            color: {
              select: {
                name: true,
                hex: true,
                translations: {
                  where: { locale: { in: localeFallbacks } },
                  select: {
                    locale: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        category: {
          select: {
            name_en: true,
            name_ko: true,
            slug: true,
            translations: {
              where: { locale: { in: localeFallbacks } },
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.productDetail.findMany({
      where: {
        product: {
          slug,
        },
      },
      select: {
        id: true,
        titleId: true,
        title_middle: true,
        title_sub: true,
        specification: true,
        note: true,
        translations: {
          where: { locale: { in: localeFallbacks } },
          select: {
            locale: true,
            title_middle: true,
            title_sub: true,
            specification: true,
            note: true,
          },
        },
      },
    }),
  ]);
  const parsedPrice = Number(rawProduct?.price);
  const priceInfo = getProductPriceInfo(
    Number.isFinite(parsedPrice) ? parsedPrice : 0,
    rawProduct?.discountRate,
    locale,
  );
  const translation = rawProduct
    ? pickTranslation(rawProduct.translations, locale)
    : undefined;
  const categoryTranslation = rawProduct
    ? pickTranslation(rawProduct.category.translations, locale)
    : undefined;
  const product =
    rawProduct === null
      ? null
      : {
          id: rawProduct.id,
          productLine: rawProduct.productLine,
          name_en: translation?.name ?? rawProduct.name_en,
          slug: rawProduct.slug,
          description: translation?.description ?? rawProduct.description,
          detailed_description:
            translation?.detailed_description ??
            rawProduct.detailed_description,
          productColor: rawProduct.productColor.map((item) => {
            const colorTranslation = pickTranslation(
              item.color.translations,
              locale,
            );

            return {
              id: item.id,
              isDefault: item.isDefault,
              color: {
                name: colorTranslation?.name ?? item.color.name,
                hex: item.color.hex,
              },
            };
          }),
          category: {
            name_en: categoryTranslation?.name ?? rawProduct.category.name_en,
            name_ko: rawProduct.category.name_ko,
            slug: rawProduct.category.slug,
          },
          ...priceInfo,
        };

  return {
    product,
    productDetails: productDetails.map((detail) => {
      const detailTranslation = pickTranslation(detail.translations, locale);

      return {
        id: detail.id,
        titleId: detail.titleId,
        title_middle:
          detailTranslation?.title_middle ?? detail.title_middle,
        title_sub: detailTranslation?.title_sub ?? detail.title_sub,
        specification:
          detailTranslation?.specification ?? detail.specification,
        note: detailTranslation?.note ?? detail.note,
      };
    }),
  };
}
