import { cn } from '@shared/lib/utils/style';

import { useReviewGalleryModalState } from '../../model/hooks/useReviewGalleryModalState';

import ReviewGalleryDetailView from './ReviewGalleryDetailView';
import ReviewGalleryGridView from './ReviewGalleryGridView';

import type { ReviewGalleryModalProps } from '../../model/reviewGalleryModal';

export function ReviewGalleryModal({
  currentPath,
  isOpen,
  images,
  totalCount,
  hasMore,
  isLoadingMore = false,
  onLoadMore,
  onClose,
  initialIndex = 0,
  initialView = 'grid',
  detailEntrySource = 'gallery',
}: ReviewGalleryModalProps) {
  const {
    selectedIndex,
    isDetailOpen,
    tileRefs,
    detailViewProps,
    openDetailModal,
  } = useReviewGalleryModalState({
    currentPath,
    isOpen,
    images,
    initialIndex,
    initialView,
    detailEntrySource,
    onClose,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-70 flex items-stretch justify-center bg-ink/70 lg:items-center lg:px-4 lg:py-5"
      role="dialog"
      aria-modal="true"
      aria-label="사진 후기 갤러리"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative h-full w-full bg-surface dark:bg-dark-bg lg:h-[64vh] lg:max-h-195 lg:max-w-5xl lg:border lg:border-line lg:shadow-2xl dark:lg:border-dark-border lg:rounded-2xl',
          isDetailOpen
            ? 'overflow-visible lg:dark:bg-dark-bg'
            : 'overflow-hidden lg:dark:bg-dark-panel',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {isDetailOpen && detailViewProps ? (
          <ReviewGalleryDetailView {...detailViewProps} />
        ) : (
          <ReviewGalleryGridView
            images={images}
            selectedIndex={selectedIndex}
            tileRefs={tileRefs}
            totalCount={totalCount}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onOpenDetailModal={openDetailModal}
            onLoadMore={onLoadMore}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
