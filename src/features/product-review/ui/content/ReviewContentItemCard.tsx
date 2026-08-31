import { useState } from 'react';

import Image from 'next/image';

import { IconStarFilled, IconThumbUp } from '@tabler/icons-react';
import { useFormatter, useTranslations } from 'next-intl';

import { MAX_REVIEW_IMAGES } from '@entities/review/model/constants';
import type { ProductReviewListItem } from '@entities/review/model/types';

import {
  getCloudinaryReviewImageUrl,
  isCloudinaryImageUrl,
} from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import type { ReviewContentCardImage } from '../../model/reviewContent';

type ReviewContentItemCardProps = {
  item: ProductReviewListItem;
  reviewImages: ReviewContentCardImage[];
  isRefreshing: boolean;
  isFeedbackPending: boolean;
  onFeedbackClick: (productReviewId: number) => void;
  onOpenImageDetail: (
    reviewImages: ReviewContentCardImage[],
    imageIndex: number,
  ) => void;
};

export default function ReviewContentItemCard({
  item,
  reviewImages,
  isRefreshing,
  isFeedbackPending,
  onFeedbackClick,
  onOpenImageDetail,
}: ReviewContentItemCardProps) {
  const t = useTranslations('ProductReview');
  const format = useFormatter();
  const isHelpfulActive = item.currentUserVote === true;
  const [isHelpfulAnimating, setIsHelpfulAnimating] = useState(false);
  const visibleReviewImages = reviewImages.slice(0, MAX_REVIEW_IMAGES);
  const reviewColorName = item.orderItem.colorName?.trim();
  const reviewColorHex = item.orderItem.colorHex;
  const maskedUser = item.user.maskedUser.trim() || t('gallery.anonymous');

  const handleFeedbackClick = () => {
    setIsHelpfulAnimating(false);
    requestAnimationFrame(() => {
      setIsHelpfulAnimating(true);
    });
    onFeedbackClick(item.id);
  };

  return (
    <article className="mb-6 break-inside-avoid rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink dark:text-surface">
              {maskedUser}
            </div>
          </div>
          <div className="shrink-0 text-xs font-medium text-muted dark:text-dark-muted">
            {item.createdAt.slice(0, 10)}
          </div>
        </div>

        <div className="mt-1.5 flex min-w-0 items-center justify-between gap-3">
          <div className="text-sm font-semibold text-ink dark:text-surface">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, idx) =>
                idx < item.rating ? (
                  <IconStarFilled
                    key={idx}
                    size={16}
                    className="text-warning/80"
                  />
                ) : (
                  <IconStarFilled
                    key={idx}
                    size={16}
                    className="text-muted/60 dark:text-dark-muted/75"
                  />
                ),
              )}
            </div>
          </div>
          {reviewColorName ? (
            <div className="inline-flex max-w-[60%] shrink-0 items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
              {reviewColorHex ? (
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-line dark:border-dark-border"
                  style={{ backgroundColor: reviewColorHex }}
                />
              ) : null}
              <span className="truncate">{reviewColorName}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <div className="overflow-hidden wrap-break-word text-xl font-semibold leading-[1.4] tracking-tight text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-surface">
          {item.title}
        </div>
        <div className="mt-3 overflow-hidden wrap-break-word whitespace-pre-line text-base leading-[1.65] text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] dark:text-dark-muted">
          {item.content}
        </div>
      </div>

      {visibleReviewImages.length ? (
        <div className="mt-5 grid grid-cols-4 gap-3 sm:gap-4">
          {visibleReviewImages.map((image, imageIdx) => (
            <button
              key={`${image.id}-${image.order ?? imageIdx}`}
              type="button"
              disabled={isRefreshing}
              aria-label={t('gallery.detailAria', { index: imageIdx + 1 })}
              className="aspect-square w-full select-none overflow-hidden rounded-2xl border border-line disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border"
              onClick={() => {
                if (isRefreshing) {
                  return;
                }

                onOpenImageDetail(visibleReviewImages, imageIdx);
              }}
            >
              <Image
                src={getCloudinaryReviewImageUrl(image.image_url, 'preview')}
                alt={t('gallery.reviewImageAlt')}
                width={112}
                height={112}
                unoptimized={isCloudinaryImageUrl(image.image_url)}
                sizes="(min-width: 768px) 6vw, 22vw"
                className="h-full w-full select-none object-cover"
                draggable={false}
                placeholder={image.blur_data_url ? 'blur' : 'empty'}
                blurDataURL={
                  typeof image.blur_data_url === 'string'
                    ? image.blur_data_url
                    : undefined
                }
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 rounded-xl bg-canvas px-3 py-3 dark:bg-dark-bg-hover">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted dark:text-dark-muted">
            {t('feedback.question')}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFeedbackClick}
              onAnimationEnd={() => setIsHelpfulAnimating(false)}
              disabled={isFeedbackPending || isRefreshing}
              aria-pressed={isHelpfulActive}
              aria-label={t('feedback.ariaLabel', {
                count: format.number(item.helpfulCount),
              })}
              className={cn(
                'inline-flex h-10 min-w-17 items-center justify-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-[background-color,border-color,color,transform,box-shadow]',
                isHelpfulActive
                  ? 'border-primary bg-primary text-on-primary shadow-[0_8px_18px_-12px_rgba(37,99,235,0.75)]'
                  : 'border-line bg-surface text-muted hover:bg-line hover:text-ink dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:bg-dark-panel-hover dark:hover:text-surface',
                isHelpfulAnimating
                  ? 'motion-safe:animate-review-helpful-pop motion-safe:will-change-transform'
                  : '',
                isFeedbackPending || isRefreshing
                  ? 'cursor-not-allowed opacity-60'
                  : '',
              )}
            >
              <IconThumbUp
                size={14}
                className={cn(
                  'transition-transform',
                  isHelpfulActive ? '-translate-y-0.5' : '',
                )}
              />
              <span>{format.number(item.helpfulCount)}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
