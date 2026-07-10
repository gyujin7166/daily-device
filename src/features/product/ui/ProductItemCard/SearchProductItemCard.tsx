
import { useTranslations } from 'next-intl';

import { ProductColorPalette } from '@entities/product/ui';

import { isProductLineValue } from '@shared/constants/productLine';
import { Link } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';

import { ProductImageLink, WishlistButton } from './ProductItemParts';
import ProductItemPrice from './ProductItemPrice';

import type { ProductItemCardProps } from './productItemCardTypes';

export default function SearchProductItemCard({
  product,
  viewModel,
  backgroundClassName,
  priorityImage,
  selectedColor,
  hasWishlistItem,
  isInWishlist,
  onColorChange,
  onToggleWishlist,
}: ProductItemCardProps) {
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
        'flex h-full flex-col rounded-3xl border border-line p-4 shadow-xs dark:border-dark-border',
        backgroundClassName,
      )}
    >
      <div className="relative">
        <ProductImageLink
          productHref={productHref}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          priorityImage={priorityImage}
          variant="search"
        />
        <WishlistButton
          visible={hasWishlistItem}
          isInWishlist={isInWishlist}
          onClick={onToggleWishlist}
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {product.productLine ? (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary dark:text-primary">
            {isProductLineValue(product.productLine)
              ? commonT(`productLines.${product.productLine}`)
              : product.productLine}
          </p>
        ) : null}

        <Link href={productHref} className="mt-1 block">
          <h3 className="line-clamp-2 text-base font-semibold leading-[1.3] tracking-[-0.01em] text-ink sm:text-lg dark:text-surface">
            {productName}
          </h3>
          {description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-normal text-muted sm:text-sm dark:text-dark-muted">
              {description}
            </p>
          ) : null}
        </Link>

        {hasColors || hasPrice ? (
          <div className="mt-auto pt-4">
            {hasColors ? (
              <ProductColorPalette
                colors={colors}
                size="sm"
                showLabel={false}
                interactive
                singleRow
                selectedColorId={selectedColor?.id ?? null}
                onColorChange={onColorChange}
              />
            ) : null}
            {hasPrice ? (
              <ProductItemPrice
                price={price}
                originalPrice={originalPrice}
                discountedPrice={discountedPrice}
                discountRate={discountRate}
                isDiscounted={isDiscounted}
                className="mt-3 text-left text-base font-semibold leading-none tracking-[-0.01em] text-ink sm:text-lg dark:text-surface"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
