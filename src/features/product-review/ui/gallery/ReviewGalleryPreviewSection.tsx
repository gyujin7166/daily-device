import Image from 'next/image';

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
  return (
    <section
      className="mt-12 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel"
      aria-label="사진 후기"
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
                    ? `사진 후기 더보기, ${hiddenGalleryCount.toLocaleString('ko-KR')}개 더 보기`
                    : `${idx + 1}번째 사진 후기 자세히 보기`
                }
                onClick={() => {
                  onOpenGalleryModal(idx);
                }}
              >
                <Image
                  src={getCloudinaryReviewImageUrl(image.image_url, 'preview')}
                  alt="상품평 갤러리 이미지"
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
                      더보기
                    </span>
                    <span className="text-xl font-bold sm:text-2xl">
                      +{hiddenGalleryCount.toLocaleString('ko-KR')}
                    </span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-7 text-sm text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted">
          {totalReviewImageCount > 0
            ? '전체 리뷰 이미지는 존재하지만 현재 페이지에는 표시할 이미지가 없습니다.'
            : '등록된 사진 후기가 없습니다.'}
        </div>
      )}
    </section>
  );
}
