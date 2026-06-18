import { useReviewContentState } from '../../model/hooks/useReviewContentState';
import { ReviewGalleryModal } from '../gallery/ReviewGalleryModal';
import ReviewGalleryPreviewSection from '../gallery/ReviewGalleryPreviewSection';

import ReviewContentControls from './ReviewContentControls';
import ReviewContentList from './ReviewContentList';

import type { ReviewContentProps } from '../../model/reviewContent';

export default function ReviewContent({
  detail,
  currentPath,
  productReview,
  currentPage = 1,
  sortOption = 'latest',
  reviewFilter = 'all',
  onSortChange,
  onFilterChange,
  isSorting = false,
  isRefreshing = false,
  isLoading = false,
}: ReviewContentProps) {
  const reviewContentState = useReviewContentState({
    detail,
    currentPath,
    productReview,
    currentPage,
    sortOption,
    isRefreshing,
    isLoading,
  });

  return (
    <>
      <ReviewGalleryModal
        currentPath={currentPath}
        {...reviewContentState.galleryModalProps}
      />

      <ReviewGalleryPreviewSection
        totalReviewImageCount={reviewContentState.safeTotalReviewImageCount}
        hasLocalGalleryItems={reviewContentState.hasLocalGalleryItems}
        previewGalleryItems={reviewContentState.previewGalleryItems}
        hiddenGalleryCount={reviewContentState.hiddenGalleryCount}
        shouldShowGallerySkeleton={reviewContentState.shouldShowGallerySkeleton}
        onOpenGalleryModal={reviewContentState.openGalleryModal}
      />

      <ReviewContentControls
        reviewFilter={reviewFilter}
        sortOption={sortOption}
        isSorting={isSorting}
        isRefreshing={isRefreshing}
        shouldShowSkeleton={reviewContentState.shouldShowSkeleton}
        safeTotalItems={reviewContentState.safeTotalItems}
        showingStart={reviewContentState.showingStart}
        showingEnd={reviewContentState.showingEnd}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />

      <ReviewContentList
        reviews={reviewContentState.reviews}
        isRefreshing={isRefreshing}
        shouldShowSkeleton={reviewContentState.shouldShowSkeleton}
        emptyMessage={
          reviewFilter === 'with_images'
            ? '이미지가 포함된 상품평이 없습니다.'
            : '표시할 상품평이 없습니다.'
        }
        getReviewImages={reviewContentState.getReviewImages}
        isFeedbackPendingForReview={
          reviewContentState.isFeedbackPendingForReview
        }
        onFeedbackClick={reviewContentState.handleFeedbackClick}
        onOpenImageDetail={reviewContentState.handleOpenReviewImageDetail}
      />
    </>
  );
}
