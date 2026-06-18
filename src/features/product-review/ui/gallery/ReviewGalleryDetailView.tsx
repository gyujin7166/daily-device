import { cn } from '@shared/lib/utils/style';

import ReviewGalleryDetailFloatingControls from './ReviewGalleryDetailFloatingControls';
import ReviewGalleryDetailImagePanel from './ReviewGalleryDetailImagePanel';
import ReviewGalleryDetailInfoPanel from './ReviewGalleryDetailInfoPanel';
import ReviewGalleryDetailMobileHeader from './ReviewGalleryDetailMobileHeader';

import type { ReviewGalleryDetailViewProps } from '../../model/reviewGalleryDetail';

export default function ReviewGalleryDetailView({
  detailImage,
  detailImageIndex,
  detailImages,
  selectedReview,
  selectedReviewId,
  selectedRating,
  helpfulCount,
  isHelpfulActive,
  isFeedbackPendingForSelected,
  canNavigateReview,
  canReturnToGallery,
  reviewTransitionDirection,
  reviewContentText,
  shouldShowContentToggle,
  isReviewContentExpanded,
  onToggleReviewContent,
  onFeedbackClick,
  onCloseDetail,
  onCloseModal,
  onPrev,
  onNext,
  onSelectDetailImage,
  formatReviewDate,
}: ReviewGalleryDetailViewProps) {
  return (
    <>
      <div className="h-full overflow-hidden lg:rounded-2xl">
        <div className="flex h-full flex-col overflow-y-auto bg-surface dark:bg-dark-panel lg:flex-row lg:overflow-visible">
          <ReviewGalleryDetailMobileHeader
            canReturnToGallery={canReturnToGallery}
            onCloseDetail={onCloseDetail}
            onCloseModal={onCloseModal}
          />

          <div
            key={selectedReviewId ?? detailImage.id}
            className={cn(
              'relative flex min-h-0 flex-1 flex-col lg:flex-row',
              reviewTransitionDirection === 'next'
                ? 'review-detail-transition-next'
                : '',
              reviewTransitionDirection === 'prev'
                ? 'review-detail-transition-prev'
                : '',
            )}
          >
            <ReviewGalleryDetailImagePanel
              detailImage={detailImage}
              detailImageIndex={detailImageIndex}
              detailImages={detailImages}
              canNavigateReview={canNavigateReview}
              onPrev={onPrev}
              onNext={onNext}
              onSelectDetailImage={onSelectDetailImage}
            />
            <ReviewGalleryDetailInfoPanel
              selectedReview={selectedReview}
              selectedReviewId={selectedReviewId}
              selectedRating={selectedRating}
              helpfulCount={helpfulCount}
              isHelpfulActive={isHelpfulActive}
              isFeedbackPendingForSelected={isFeedbackPendingForSelected}
              reviewContentText={reviewContentText}
              shouldShowContentToggle={shouldShowContentToggle}
              isReviewContentExpanded={isReviewContentExpanded}
              onToggleReviewContent={onToggleReviewContent}
              onFeedbackClick={onFeedbackClick}
              formatReviewDate={formatReviewDate}
            />
          </div>
        </div>
      </div>

      <ReviewGalleryDetailFloatingControls
        canNavigateReview={canNavigateReview}
        canReturnToGallery={canReturnToGallery}
        onCloseDetail={onCloseDetail}
        onCloseModal={onCloseModal}
        onPrev={onPrev}
        onNext={onNext}
      />
    </>
  );
}
