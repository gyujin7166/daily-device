import { IconMinus, IconPlus, IconShoppingBag } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { ProductColorOption } from '@entities/product/model/types';
import { ProductColorPalette } from '@entities/product/ui';

type ProductDetailPurchaseSectionProps = {
  displayPrice: string;
  originalPriceLabel?: string;
  discountedPriceLabel?: string;
  discountRate?: number;
  isDiscounted?: boolean;
  description?: string | null;
  colors: ProductColorOption[];
  quantity: number;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onColorChange: (color: { id: number; name: string; hex: string }) => void;
  onAddToCart: () => void;
  isAddToCartDisabled?: boolean;
  onBuyNow: () => void;
};

export default function ProductDetailPurchaseSection({
  displayPrice,
  originalPriceLabel,
  discountedPriceLabel,
  discountRate = 0,
  isDiscounted = false,
  description,
  colors,
  quantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onColorChange,
  onAddToCart,
  isAddToCartDisabled = false,
  onBuyNow,
}: ProductDetailPurchaseSectionProps) {
  const t = useTranslations('ProductDetail.purchase');

  return (
    <>
      <div className="mt-4">
        {isDiscounted && originalPriceLabel && discountedPriceLabel ? (
          <div className="mb-2 flex items-center gap-2 text-base font-semibold leading-none">
            <span className="text-danger">{discountRate}%</span>
            <span className="text-muted line-through dark:text-dark-muted">
              {originalPriceLabel}
            </span>
          </div>
        ) : null}
        <div className="text-4xl font-semibold leading-none tracking-[-0.02em] text-ink dark:text-surface">
          {isDiscounted && discountedPriceLabel
            ? discountedPriceLabel
            : displayPrice}
        </div>
      </div>

      {description ? (
        <p className="mt-4 text-sm leading-[1.55] text-muted dark:text-dark-muted">
          {description}
        </p>
      ) : null}

      {colors.length > 0 ? (
        <div className="mt-5">
          <p className="text-base font-semibold text-ink dark:text-surface">
            {t('color')}
          </p>
          <ProductColorPalette colors={colors} onColorChange={onColorChange} />
        </div>
      ) : null}

      <div className="mt-6">
        <p className="text-base font-semibold text-ink dark:text-surface">
          {t('quantity')}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onDecreaseQuantity}
            disabled={quantity <= 1}
            aria-label={t('decreaseQuantity')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-surface transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text dark:bg-surface dark:text-dark-bg dark:hover:bg-surface/85"
          >
            <IconMinus size={17} stroke={2.4} />
          </button>
          <span className="inline-flex h-9 min-w-18 items-center justify-center rounded-full border border-line bg-line px-6 text-base font-semibold text-ink dark:border-dark-border dark:bg-dark-panel-deep dark:text-surface">
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncreaseQuantity}
            disabled={quantity >= 10}
            aria-label={t('increaseQuantity')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-surface transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text dark:bg-surface dark:text-dark-bg dark:hover:bg-surface/85"
          >
            <IconPlus size={18} stroke={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAddToCartDisabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-lg font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text"
        >
          <IconShoppingBag size={18} />
          {t('addToCart')}
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-surface px-6 py-3.5 text-lg font-semibold text-primary transition-colors hover:bg-primary-soft dark:bg-transparent dark:text-primary dark:hover:bg-dark-panel"
        >
          {t('buyNow')}
        </button>
      </div>
    </>
  );
}
