import Image from 'next/image';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { getCloudinaryReviewImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import type { ReviewGalleryDetailImageItem } from '../../model/reviewGalleryDetail';

type ReviewGalleryDetailImagePanelProps = {
  detailImage: ReviewGalleryDetailImageItem;
  detailImageIndex: number;
  detailImages: ReviewGalleryDetailImageItem[];
  canNavigateReview: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectDetailImage: (imageId: number) => void;
};

export default function ReviewGalleryDetailImagePanel({
  detailImage,
  detailImageIndex,
  detailImages,
  canNavigateReview,
  onPrev,
  onNext,
  onSelectDetailImage,
}: ReviewGalleryDetailImagePanelProps) {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col bg-[#ECEFF3] px-3 pb-3 pt-3 sm:px-5 sm:py-5 dark:bg-dark-bg lg:w-[58%]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="flex w-full flex-1 items-center justify-center lg:pt-8">
          <div className="relative h-[50vh] min-h-70 max-h-130 w-full max-w-140 select-none lg:h-[54vh] lg:max-h-135">
            <Image
              src={getCloudinaryReviewImageUrl(detailImage.image_url, 'detail')}
              alt={`선택된 사진 후기 ${detailImageIndex + 1}`}
              fill
              sizes="(min-width: 1280px) 520px, (min-width: 1024px) 50vw, 90vw"
              className="select-none rounded-xl"
              draggable={false}
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>
        </div>

        {detailImages.length > 1 || canNavigateReview ? (
          <div className="mt-2 w-full sm:mt-3">
            <div className="mx-auto flex w-full max-w-140 items-center justify-center gap-2">
              {canNavigateReview ? (
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:bg-primary-soft lg:hidden dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
                  aria-label="이전 상품평"
                >
                  <IconChevronLeft size={20} />
                </button>
              ) : null}

              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto px-1 pb-1 sm:gap-2">
                {detailImages.map((image, idx) => (
                  <button
                    key={`detail-thumb-${image.id}-${image.order}-${idx}`}
                    type="button"
                    onClick={() => onSelectDetailImage(image.id)}
                    aria-label={`${idx + 1}번째 사진 후기 이미지 선택`}
                    className={cn(
                      'relative h-12 w-12 shrink-0 select-none overflow-hidden rounded-xl border-2 bg-surface transition-colors sm:h-14 sm:w-14 dark:bg-dark-panel',
                      idx === detailImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-line hover:border-primary/35 dark:border-dark-border dark:hover:border-primary/50',
                    )}
                  >
                    <Image
                      src={getCloudinaryReviewImageUrl(
                        image.image_url,
                        'preview',
                      )}
                      alt={`썸네일 ${idx + 1}`}
                      fill
                      sizes="56px"
                      className="select-none rounded-[10px] object-cover"
                      draggable={false}
                      placeholder={image.blur_data_url ? 'blur' : 'empty'}
                      blurDataURL={image.blur_data_url ?? undefined}
                    />
                  </button>
                ))}
              </div>

              {canNavigateReview ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:bg-primary-soft lg:hidden dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
                  aria-label="다음 상품평"
                >
                  <IconChevronRight size={20} />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
