import { useEffect, useState } from 'react';
import type { MouseEventHandler } from 'react';

import Image from 'next/image';

import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Link } from '@shared/lib/i18n/navigation';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import type { ProductItemVariant } from '../../model/productItem';

type ProductImageLinkProps = {
  productHref: string;
  imageUrl: string;
  imageAlt: string;
  priorityImage: boolean;
  variant: ProductItemVariant;
};

type WishlistButtonProps = {
  visible: boolean;
  isInWishlist: boolean;
  compact?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function ProductImageLink({
  productHref,
  imageUrl,
  imageAlt,
  priorityImage,
  variant,
}: ProductImageLinkProps) {
  const isCatalog = variant === 'catalog';
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isPendingImageLoaded, setIsPendingImageLoaded] = useState(false);
  const imageClassName = isCatalog
    ? 'object-contain transition-transform duration-300 group-hover:scale-[1.02]'
    : 'object-contain p-3';

  useEffect(() => {
    if (imageUrl === currentImageUrl || imageUrl === pendingImageUrl) {
      return;
    }

    setPendingImageUrl(imageUrl);
    setIsPendingImageLoaded(false);
  }, [currentImageUrl, imageUrl, pendingImageUrl]);

  return (
    <Link
      href={productHref}
      draggable={false}
      className={cn(isCatalog ? 'group block select-none' : 'block select-none')}
    >
      <div
        className={
          isCatalog
            ? 'relative aspect-square overflow-hidden rounded-2xl bg-line dark:bg-dark-bg-hover'
            : 'relative aspect-square overflow-hidden rounded-3xl bg-primary-soft/55 p-4 dark:bg-dark-bg-hover'
        }
      >
        <span className="absolute inset-0">
          <Image
            src={getCloudinaryImageUrl(currentImageUrl, 'productCard')}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className={imageClassName}
            draggable={false}
            loading={priorityImage ? 'eager' : 'lazy'}
          />
        </span>
        {pendingImageUrl ? (
          <span
            className={cn(
              'absolute inset-0 transition-opacity duration-100 ease-linear',
              isPendingImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onTransitionEnd={() => {
              if (!isPendingImageLoaded || !pendingImageUrl) {
                return;
              }

              setCurrentImageUrl(pendingImageUrl);
              setPendingImageUrl(null);
              setIsPendingImageLoaded(false);
            }}
          >
            <Image
              key={pendingImageUrl}
              src={getCloudinaryImageUrl(pendingImageUrl, 'productCard')}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={imageClassName}
              draggable={false}
              loading={priorityImage ? 'eager' : 'lazy'}
              onLoad={() => setIsPendingImageLoaded(true)}
            />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function WishlistButton({
  visible,
  isInWishlist,
  compact = false,
  onClick,
}: WishlistButtonProps) {
  const t = useTranslations('ProductDetail.purchase');

  if (!visible) {
    return null;
  }

  const iconSize = compact ? 16 : 18;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute z-10 inline-flex items-center justify-center rounded-full border transition-colors',
        compact
          ? 'right-2 top-2 h-8 w-8 sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9'
          : 'right-3 top-3 h-9 w-9',
        isInWishlist
          ? 'border-primary bg-primary-soft text-primary dark:bg-primary-soft'
          : 'border-line bg-surface text-muted hover:bg-canvas dark:border-dark-border dark:bg-dark-panel-deep dark:text-dark-muted dark:hover:bg-dark-panel-hover',
      )}
      aria-label={isInWishlist ? t('wishlistRemove') : t('wishlistAdd')}
      aria-pressed={isInWishlist}
    >
      {isInWishlist ? (
        <IconHeartFilled size={iconSize} />
      ) : (
        <IconHeart size={iconSize} />
      )}
    </button>
  );
}
