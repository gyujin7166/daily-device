import type { RefObject } from 'react';

import Image from 'next/image';

import { IconX } from '@tabler/icons-react';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import { getCloudinaryReviewImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

type ReviewGalleryGridViewProps = {
  images: ProductReviewGalleryImage[];
  selectedIndex: number;
  tileRefs: RefObject<Array<HTMLButtonElement | null>>;
  totalCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onOpenDetailModal: (index: number) => void;
  onLoadMore?: () => void;
  onClose: () => void;
};

export default function ReviewGalleryGridView({
  images,
  selectedIndex,
  tileRefs,
  totalCount,
  hasMore,
  isLoadingMore,
  onOpenDetailModal,
  onLoadMore,
  onClose,
}: ReviewGalleryGridViewProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-line px-4 py-5 sm:px-6 sm:py-6 dark:border-dark-border">
        <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl dark:text-surface">
          사진 후기
        </h3>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-ink dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
          onClick={onClose}
          aria-label="갤러리 닫기"
        >
          <IconX size={26} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-7 sm:px-6">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-1.5 sm:grid-cols-3 sm:gap-x-2 md:grid-cols-4 md:gap-x-2.5 lg:grid-cols-6 xl:grid-cols-6">
            {images.map((image, idx) => (
              <button
                key={`${image.id}-${image.order}-${idx}`}
                ref={(node) => {
                  tileRefs.current[idx] = node;
                }}
                type="button"
                onClick={() => onOpenDetailModal(idx)}
                aria-label={`${idx + 1}번째 사진 후기 자세히 보기`}
                className="group relative aspect-square select-none overflow-hidden rounded-xl border border-line transition dark:border-dark-border"
              >
                <Image
                  src={getCloudinaryReviewImageUrl(image.image_url, 'preview')}
                  alt={`사진 후기 ${idx + 1}`}
                  width={220}
                  height={220}
                  sizes="(min-width: 1280px) 168px, (min-width: 1024px) 156px, (min-width: 768px) 170px, (min-width: 640px) 150px, 140px"
                  className="h-full w-full select-none rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  draggable={false}
                  placeholder={image.blur_data_url ? 'blur' : 'empty'}
                  blurDataURL={image.blur_data_url ?? undefined}
                />
                <span
                  className={cn(
                    'pointer-events-none absolute inset-0 transition-colors duration-200',
                    idx === selectedIndex
                      ? 'bg-primary/12 dark:bg-primary/18'
                      : 'bg-transparent group-hover:bg-primary/10 dark:group-hover:bg-primary/15',
                  )}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-base text-muted dark:border-dark-border dark:text-dark-muted">
            표시할 사진 후기가 없습니다.
          </div>
        )}

        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover"
            >
              {isLoadingMore ? '불러오는 중...' : '더보기'}
            </button>
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-line px-8 py-4 text-sm font-medium text-muted sm:px-10 sm:text-base dark:border-dark-border dark:text-dark-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span>총 {totalCount.toLocaleString('ko-KR')}장</span>
      </footer>
    </div>
  );
}
