import { useState } from 'react';

import { IconStarFilled, IconThumbUp } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

import type { ReviewGallerySelectedReview } from '../../model/reviewGalleryDetail';

type ReviewGalleryDetailInfoPanelProps = {
  selectedReview: ReviewGallerySelectedReview;
  selectedReviewId: number | null;
  selectedRating: number;
  helpfulCount: number;
  isHelpfulActive: boolean;
  isFeedbackPendingForSelected: boolean;
  reviewContentText: string;
  shouldShowContentToggle: boolean;
  isReviewContentExpanded: boolean;
  onToggleReviewContent: () => void;
  onFeedbackClick: () => void;
  formatReviewDate: (createdAt?: string) => string;
};

export default function ReviewGalleryDetailInfoPanel({
  selectedReview,
  selectedReviewId,
  selectedRating,
  helpfulCount,
  isHelpfulActive,
  isFeedbackPendingForSelected,
  reviewContentText,
  shouldShowContentToggle,
  isReviewContentExpanded,
  onToggleReviewContent,
  onFeedbackClick,
  formatReviewDate,
}: ReviewGalleryDetailInfoPanelProps) {
  const [isHelpfulAnimating, setIsHelpfulAnimating] = useState(false);
  const reviewColorName = selectedReview?.orderItem.colorName?.trim();
  const reviewColorHex = selectedReview?.orderItem.colorHex;

  const handleFeedbackClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (selectedReviewId) {
      setIsHelpfulAnimating(false);
      requestAnimationFrame(() => {
        setIsHelpfulAnimating(true);
      });
      onFeedbackClick();
    }
  };

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-line bg-surface dark:border-dark-border dark:bg-dark-panel lg:w-[42%] lg:min-w-90 lg:border-t-0 lg:border-l">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-8">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-all text-lg font-semibold leading-none text-ink sm:text-lg dark:text-surface">
            {selectedReview?.user.maskedUser ?? '익명'}
          </p>
          <button
            type="button"
            onClick={handleFeedbackClick}
            onAnimationEnd={() => setIsHelpfulAnimating(false)}
            disabled={isFeedbackPendingForSelected || !selectedReviewId}
            aria-pressed={isHelpfulActive}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-[background-color,border-color,color,transform,box-shadow] lg:hidden',
              isHelpfulActive
                ? 'border-primary bg-primary text-surface shadow-[0_8px_18px_-12px_rgba(37,99,235,0.75)]'
                : 'border-line bg-canvas text-muted hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel-hover dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface',
              isHelpfulAnimating
                ? 'motion-safe:animate-review-helpful-pop motion-safe:will-change-transform'
                : '',
              isFeedbackPendingForSelected || !selectedReviewId
                ? 'cursor-not-allowed opacity-60'
                : '',
            )}
          >
            <IconThumbUp
              size={13}
              className={cn(
                'transition-transform',
                isHelpfulActive ? '-translate-y-0.5' : '',
              )}
            />
            <span>도움돼요</span>
            <span>{helpfulCount.toLocaleString('ko-KR')}</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2.5 sm:mt-4 sm:gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <IconStarFilled
                key={`detail-star-${idx}`}
                size={16}
                className={
                  idx < selectedRating
                    ? 'text-warning'
                    : 'text-muted/60 dark:text-dark-muted/75'
                }
              />
            ))}
          </div>
          <span className="text-lg font-semibold text-ink sm:text-xl dark:text-surface">
            {selectedRating.toFixed(1)} / 5.0
          </span>
        </div>

        {reviewColorName ? (
          <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted sm:mt-4 dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
            {reviewColorHex ? (
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-line dark:border-dark-border"
                style={{ backgroundColor: reviewColorHex }}
              />
            ) : null}
            <span className="truncate">{reviewColorName}</span>
          </div>
        ) : null}

        <h4 className="mt-3 wrap-break-word text-lg font-semibold leading-tight tracking-tight text-ink sm:mt-4 sm:text-[clamp(18px,1.7vw,22px)] dark:text-surface">
          {selectedReview?.title ?? '리뷰 제목이 없습니다.'}
        </h4>

        <div className="mt-2.5 sm:mt-3">
          <p
            className={cn(
              'max-h-45 overflow-y-auto wrap-break-word whitespace-pre-line pr-1 text-sm leading-[1.6] text-muted sm:text-base sm:leading-[1.65] dark:text-dark-muted',
              isReviewContentExpanded
                ? 'lg:max-h-65'
                : 'lg:max-h-32.5 lg:overflow-hidden',
            )}
          >
            {reviewContentText}
          </p>
          {shouldShowContentToggle ? (
            <button
              type="button"
              onClick={onToggleReviewContent}
              className="mt-2 hidden text-xs font-semibold text-primary hover:underline lg:inline-flex"
            >
              {isReviewContentExpanded ? '접기' : '더보기'}
            </button>
          ) : null}
        </div>

        <div className="mt-6 text-xs font-medium tracking-[0.02em] text-muted sm:mt-9 dark:text-dark-muted">
          리뷰 작성일 {formatReviewDate(selectedReview?.createdAt)}
        </div>

        <div className="mt-6 hidden border-t border-line pt-4 lg:block lg:pt-6 dark:border-dark-border">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted dark:text-dark-muted">
            <IconThumbUp
              size={16}
              className={
                isHelpfulActive ? 'text-primary dark:text-surface' : undefined
              }
            />
            <span>
              {helpfulCount.toLocaleString('ko-KR')}명이 도움이 되었다고 했어요
            </span>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-line px-4 py-4 lg:block lg:px-6 dark:border-dark-border">
        <button
          type="button"
          onClick={handleFeedbackClick}
          onAnimationEnd={() => setIsHelpfulAnimating(false)}
          disabled={isFeedbackPendingForSelected || !selectedReviewId}
          aria-pressed={isHelpfulActive}
          className={cn(
            'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] sm:h-14 sm:text-base',
            isHelpfulActive
              ? 'bg-primary text-surface shadow-[0_10px_22px_-14px_rgba(37,99,235,0.8)] hover:bg-primary/90'
              : 'bg-ink text-surface shadow-xs hover:bg-ink/90 dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface dark:hover:border-surface/20 dark:hover:bg-dark-bg',
            isHelpfulAnimating
              ? 'motion-safe:animate-review-helpful-pop motion-safe:will-change-transform'
              : '',
            isFeedbackPendingForSelected || !selectedReviewId
              ? 'cursor-not-allowed opacity-60'
              : '',
          )}
        >
          <IconThumbUp
            size={18}
            className={cn(
              'transition-transform',
              isHelpfulActive ? '-translate-y-0.5' : '',
            )}
          />
          <span>{isHelpfulActive ? '도움이 됐어요' : '도움이 돼요'}</span>
        </button>
      </div>
    </aside>
  );
}
