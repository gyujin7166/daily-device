import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { isProductLineValue } from '@shared/constants/productLine';
import { cn } from '@shared/lib/utils/style';

type ProductDetailHeaderProps = {
  productLine?: string | null;
  name: string;
  isInWishlist: boolean;
  isWishlistDisabled: boolean;
  onWishlistToggle: () => void;
};

export default function ProductDetailHeader({
  productLine,
  name,
  isInWishlist,
  isWishlistDisabled,
  onWishlistToggle,
}: ProductDetailHeaderProps) {
  const t = useTranslations('ProductDetail.purchase');
  const commonT = useTranslations('Common');
  const productLineLabel = isProductLineValue(productLine)
    ? commonT(`productLines.${productLine}`)
    : productLine;

  return (
    <div className="pt-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm dark:text-primary">
        {productLineLabel || t('productLineFallback')}
      </p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink sm:text-3xl dark:text-surface">
          {name}
        </h1>
        <button
          type="button"
          onClick={onWishlistToggle}
          disabled={isWishlistDisabled}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            isInWishlist
              ? 'border-primary bg-primary-soft dark:bg-primary-soft text-primary'
              : 'border-line dark:border-dark-border bg-surface dark:bg-dark-bg text-muted dark:text-dark-muted hover:bg-canvas dark:hover:bg-dark-bg-hover',
          )}
          aria-label={isInWishlist ? t('wishlistRemove') : t('wishlistAdd')}
          aria-pressed={isInWishlist}
        >
          {isInWishlist ? (
            <IconHeartFilled size={19} />
          ) : (
            <IconHeart size={19} />
          )}
        </button>
      </div>
    </div>
  );
}
