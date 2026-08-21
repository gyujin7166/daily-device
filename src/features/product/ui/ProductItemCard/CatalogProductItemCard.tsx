import { IconShoppingBag } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { ProductColorPalette } from '@entities/product/ui';

import { isProductLineValue } from '@shared/constants/productLine';
import { Link } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';

import { ProductImageLink, WishlistButton } from './ProductItemParts';
import ProductItemPrice from './ProductItemPrice';

import type { ProductItemCardProps } from './productItemCardTypes';

export default function CatalogProductItemCard({
  product,
  viewModel,
  backgroundClassName,
  priorityImage,
  selectedColor,
  onColorChange,
  hasWishlistItem,
  isInWishlist,
  canAddToCart,
  onToggleWishlist,
  onAddToCart,
}: ProductItemCardProps) {
  const t = useTranslations('ProductFilter.actions');
  const commonT = useTranslations('Common');
  const {
    productName,
    productHref,
    imageUrl,
    imageAlt,
    price,
    originalPrice,
    discountedPrice,
    discountRate,
    isDiscounted,
    hasPrice,
    description,
    colors,
    hasColors,
  } = viewModel;

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-3xl p-3 shadow-xs sm:p-3',
        backgroundClassName,
      )}
    >
      <div className="relative">
        <ProductImageLink
          productHref={productHref}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          priorityImage={priorityImage}
        />
        <WishlistButton
          visible={hasWishlistItem}
          isInWishlist={isInWishlist}
          compact
          onClick={onToggleWishlist}
        />
      </div>

      <div className="px-1 pb-1 mt-3 flex flex-1 flex-col sm:mt-2">
        {product.productLine ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary dark:text-primary">
            {isProductLineValue(product.productLine)
              ? commonT(`productLines.${product.productLine}`)
              : product.productLine}
          </p>
        ) : null}

        <Link href={productHref} className="mt-1 block">
          <h2 className="line-clamp-2 text-base font-semibold leading-[1.32] tracking-[-0.014em] text-ink sm:text-lg dark:text-surface">
            {productName}
          </h2>
          {description ? (
            <p className="mt-1.5 line-clamp-1 min-h-[1.45em] text-xs leading-[1.45] text-muted sm:text-sm dark:text-dark-muted">
              {description}
            </p>
          ) : (
            <span aria-hidden className="mt-1.5 block min-h-[1.45em]" />
          )}
        </Link>

        {hasColors ? (
          <div className="mt-3 flex min-h-5 w-full items-center justify-start">
            <ProductColorPalette
              colors={colors}
              size="sm"
              showLabel={false}
              interactive
              singleRow
              inline
              selectedColorId={selectedColor?.id ?? null}
              onColorChange={onColorChange}
            />
          </div>
        ) : (
          <span aria-hidden className="mt-3 block min-h-5" />
        )}

        <div className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-3">
          {hasPrice ? (
            <ProductItemPrice
              price={price}
              originalPrice={originalPrice}
              discountedPrice={discountedPrice}
              discountRate={discountRate}
              isDiscounted={isDiscounted}
              className="shrink-0 self-start text-base font-semibold leading-none text-ink sm:text-lg dark:text-surface"
            />
          ) : (
            <span aria-hidden className="block min-h-10" />
          )}

          <button
            type="button"
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text dark:bg-primary dark:hover:bg-primary-hover"
            aria-label={t('addToCart')}
          >
            <IconShoppingBag size={18} stroke={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
