import { useFormatter, useLocale, useTranslations } from 'next-intl';

import { isProductLineValue } from '@shared/constants/productLine';
import { getProductPriceInfo } from '@shared/lib/price/discount';
import { cn } from '@shared/lib/utils/style';
import {
  DebouncedSearchInput,
  ImageUrlList,
  PaginationControls,
  RowActions,
  TableHeader,
  inputClass,
} from '@shared/ui/AdminControls';

import type {
  AdminProduct,
  AdminProductListParams,
  AdminProductPayload,
  ProductCategory,
} from '../model/types';

const getLocalizedCategoryName = (
  category: Pick<ProductCategory, 'name_en' | 'name_ko'>,
  locale: string,
) =>
  (locale === 'en' ? category.name_en : category.name_ko) || category.name_en;

const getLocalizedProductName = (
  product: Pick<AdminProduct, 'name_en' | 'name_ko' | 'translations'>,
  locale: string,
) =>
  product.translations.find((translation) => translation.locale === locale)
    ?.name ??
  (locale === 'en' ? product.name_en : product.name_ko) ??
  product.name_en;

const getLocalizedColorName = (
  color: AdminProduct['productColor'][number]['color'],
  locale: string,
) =>
  color.translations.find((translation) => translation.locale === locale)
    ?.name ?? color.name;

type AdminProductListSectionProps = {
  params: AdminProductListParams;
  productPage?: AdminProductPayload['products'];
  products: AdminProduct[];
  categories: ProductCategory[];
  selectedProductId: number | null;
  isFetching: boolean;
  isSaving: boolean;
  onKeywordChange: (keyword: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
};

export default function AdminProductListSection({
  params,
  productPage,
  products,
  categories,
  selectedProductId,
  isFetching,
  isSaving,
  onKeywordChange,
  onCategoryChange,
  onPageChange,
  onEdit,
  onDelete,
}: AdminProductListSectionProps) {
  const locale = useLocale();
  const t = useTranslations('AdminProduct.list');
  const commonT = useTranslations('Common');
  const format = useFormatter();

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <TableHeader title={t('title')} count={productPage?.total ?? 0} />
      <div className="grid gap-3 border-b border-line p-4 dark:border-dark-border md:grid-cols-[1fr_180px]">
        <DebouncedSearchInput
          className={inputClass}
          value={params.keyword}
          onChange={onKeywordChange}
          placeholder={t('searchPlaceholder')}
        />
        <select
          aria-label={t('category')}
          className={inputClass}
          value={params.categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">{t('allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalizedCategoryName(category, locale)}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead className="bg-canvas text-xs uppercase text-muted dark:bg-dark-bg dark:text-dark-muted">
            <tr>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">{t('product')}</th>
              <th className="px-3 py-3">{t('imageUrl')}</th>
              <th className="px-3 py-3">{t('category')}</th>
              <th className="px-3 py-3">{t('color')}</th>
              <th className="px-3 py-3 text-right">{t('price')}</th>
              <th className="px-3 py-3 text-center">{t('manage')}</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : undefined}>
            {products.map((product) => {
              const priceInfo = getProductPriceInfo(
                product.price,
                product.discountRate,
                locale,
              );

              return (
                <tr
                  key={product.id}
                  className={cn(
                    'border-t border-line dark:border-dark-border',
                    selectedProductId === product.id &&
                      'bg-primary-soft/80 dark:bg-primary/15',
                  )}
                >
                  <td className=" px-3 py-3 font-semibold">{product.id}</td>
                  <td className="px-3 py-3">
                    <p className="truncate font-semibold">
                      {getLocalizedProductName(product, locale)}
                    </p>
                    <p className="truncate text-xs text-muted dark:text-dark-muted">
                      {product.productLine
                        ? isProductLineValue(product.productLine)
                          ? commonT(`productLines.${product.productLine}`)
                          : product.productLine
                        : product.slug}
                    </p>
                    <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                      {t('imageCount', {
                        count: format.number(product.images.length),
                      })}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <ImageUrlList
                      items={product.images.map((image) => ({
                        id: image.id,
                        url: image.image_url,
                        label: image.isMain ? t('mainImage') : undefined,
                      }))}
                    />
                  </td>
                  <td className=" px-3 py-3">
                    {getLocalizedCategoryName(product.category, locale)}
                  </td>
                  <td className="px-3 py-3">
                    {product.productColor.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.productColor.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 text-xs font-semibold dark:border-dark-border"
                          >
                            <span
                              className="h-3 w-3 rounded-full border border-line dark:border-dark-border"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            {getLocalizedColorName(item.color, locale)}
                            {item.isDefault ? t('defaultColorSuffix') : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted dark:text-dark-muted">-</span>
                    )}
                  </td>
                  <td className=" px-3 py-3 text-right">
                    {priceInfo.isDiscounted ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted line-through dark:text-dark-muted">
                          {priceInfo.originalPriceLabel}
                        </p>
                        <p className="font-semibold">
                          {priceInfo.discountedPriceLabel}
                        </p>
                        <p className="text-xs font-semibold text-danger">
                          {t('discount', { rate: priceInfo.discountRate })}
                        </p>
                      </div>
                    ) : (
                      <span>{priceInfo.priceLabel}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex justify-center">
                      <RowActions
                        disabled={isSaving}
                        className="flex-col items-center "
                        onEdit={() => onEdit(product)}
                        onDelete={() => onDelete(product)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={productPage?.page ?? 1}
        totalPages={productPage?.totalPages ?? 1}
        onPageChange={onPageChange}
      />
    </div>
  );
}
