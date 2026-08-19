import { IconStarFilled } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

type ProductDetailRatingSectionProps = {
  reviewCount: number;
  averageRating: number;
  isReviewSummaryLoading: boolean;
};

export default function ProductDetailRatingSection({
  reviewCount,
  averageRating,
  isReviewSummaryLoading,
}: ProductDetailRatingSectionProps) {
  const locale = useLocale();
  const t = useTranslations('ProductDetail.rating');

  if (isReviewSummaryLoading) {
    return (
      <div className="mt-1 flex items-center gap-3">
        <div className="h-6 w-34 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
        <div className="h-4 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
      </div>
    );
  }

  const safeReviewCount = Math.max(0, Math.floor(reviewCount));
  const safeAverageRating = Math.max(0, Math.min(5, averageRating));
  const roundedAverageRating = Math.round(safeAverageRating * 2) / 2;
  const fullStarCount = Math.floor(roundedAverageRating);
  const hasHalfStar = roundedAverageRating - fullStarCount >= 0.5;
  const emptyStarCount = 5 - fullStarCount - (hasHalfStar ? 1 : 0);

  return (
    <div
      className="mt-1 flex items-center gap-3"
      role="img"
      aria-label={t('ariaLabel', {
        rating: roundedAverageRating,
        count: safeReviewCount,
      })}
    >
      <div className="flex items-center">
        {Array.from({ length: fullStarCount }).map((_, idx) => (
          <IconStarFilled
            key={`full-star-${idx}`}
            size={24}
            className="mr-0.5 text-warning"
          />
        ))}
        {hasHalfStar ? (
          <span className="relative mr-0.5 inline-flex h-6 w-6 items-center justify-center">
            <IconStarFilled
              size={24}
              className="absolute text-warning"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
            <IconStarFilled
              size={24}
              className="absolute text-muted/60 dark:text-dark-muted/75"
              style={{ clipPath: 'inset(0 0 0 50%)' }}
            />
          </span>
        ) : null}
        {Array.from({ length: emptyStarCount }).map((_, idx) => (
          <IconStarFilled
            key={`empty-star-${idx}`}
            size={24}
            className="mr-0.5 text-muted/60 dark:text-dark-muted/75"
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-primary dark:text-primary">
        {t('reviewCount', {
          count: safeReviewCount.toLocaleString(
            locale === 'ko' ? 'ko-KR' : 'en-US',
          ),
        })}
      </span>
    </div>
  );
}
