import Image from 'next/image';

import { useFormatter, useTranslations } from 'next-intl';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import { getCloudinaryReviewImageUrl } from '@shared/lib/utils/cloudinaryImage';

type ReviewGalleryPreviewSectionProps = {
  totalReviewImageCount: number;
  hasLocalGalleryItems: boolean;
  previewGalleryItems: ProductReviewGalleryImage[];
  hiddenGalleryCount: number;
  shouldShowGallerySkeleton: boolean;
  onOpenGalleryModal: (startIndex?: number) => void;
};

export default function ReviewGalleryPreviewSection({
  totalReviewImageCount,
  hasLocalGalleryItems,
  previewGalleryItems,
  hiddenGalleryCount,
  shouldShowGallerySkeleton,
  onOpenGalleryModal,
}: ReviewGalleryPreviewSectionProps) {
  const t = useTranslations('ProductReview.gallery');
  const format = useFormatter();

  return (
    <section
      className="mt-12 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel"
      aria-label={t('previewLabel')}
    >
      {shouldShowGallerySkeleton ? (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:grid-cols-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`gallery-skeleton-${idx}`}
              className="aspect-square animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border"
            />
          ))}
        </div>
      ) : hasLocalGalleryItems ? (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:grid-cols-8">
          {previewGalleryItems.map((image, idx) => {
            const isMoreTile =
              idx === previewGalleryItems.length - 1 && hiddenGalleryCount > 0;

            return (
              <button
                key={`${image.id}-${image.order}`}
                type="button"
                className="relative aspect-square select-none overflow-hidden rounded-xl border border-line dark:border-dark-border"
                aria-label={
                  isMoreTile
                    ? t('moreAria', {
                        count: format.number(hiddenGalleryCount),
                      })
                    : t('detailAria', { index: idx + 1 })
                }
                onClick={() => {
                  onOpenGalleryModal(idx);
                }}
              >
                <Image
                  src={getCloudinaryReviewImageUrl(image.image_url, 'preview')}
                  alt={t('imageAlt')}
                  width={124}
                  height={124}
                  sizes="124px"
                  className="h-full w-full select-none rounded-xl object-cover"
                  draggable={false}
                  placeholder={image.blur_data_url ? 'blur' : 'empty'}
                  blurDataURL={image.blur_data_url ?? undefined}
                />
                {isMoreTile ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/70 text-surface">
                    <span className="text-sm font-semibold sm:text-base">
                      {t('more')}
                    </span>
                    <span className="text-xl font-bold sm:text-2xl">
                      +{format.number(hiddenGalleryCount)}
                    </span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-7 text-sm text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted">
          {totalReviewImageCount > 0 ? t('noImagesCurrentPage') : t('noImages')}
        </div>
      )}
    </section>
  );
}
