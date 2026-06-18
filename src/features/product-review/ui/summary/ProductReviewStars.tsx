import { IconStarFilled } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

type ProductReviewStarsProps = {
  fullStarCount: number;
  hasHalfStar: boolean;
  emptyStarCount: number;
  hasReviews: boolean;
};

export default function ProductReviewStars({
  fullStarCount,
  hasHalfStar,
  emptyStarCount,
  hasReviews,
}: ProductReviewStarsProps) {
  const activeStarClassName = hasReviews
    ? 'text-warning/80'
    : 'text-muted/60 dark:text-dark-muted/75';

  return (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {Array.from({ length: fullStarCount }).map((_, index) => (
        <IconStarFilled
          key={`full-star-${index}`}
          size={22}
          className={activeStarClassName}
        />
      ))}
      {hasHalfStar ? (
        <span className="relative inline-flex h-5.5 w-5.5 items-center justify-center">
          <IconStarFilled
            size={22}
            className={cn('absolute', activeStarClassName)}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
          <IconStarFilled
            size={22}
            className="absolute text-muted/60 dark:text-dark-muted/75"
            style={{ clipPath: 'inset(0 0 0 50%)' }}
          />
        </span>
      ) : null}
      {Array.from({ length: emptyStarCount }).map((_, index) => (
        <IconStarFilled
          key={`empty-star-${index}`}
          size={22}
          className="text-muted/60 dark:text-dark-muted/75"
        />
      ))}
    </div>
  );
}
