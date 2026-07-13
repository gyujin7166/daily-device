import { useTranslations } from 'next-intl';

import ProgressBar from '@shared/ui/ProgressBar/ProgressBar';

import { ProductReviewProgressSkeleton } from './ProductReviewHeaderSkeleton';

type ProductReviewDistributionProps = {
  displayPercentages: number[];
  isInView: boolean;
  isLoading: boolean;
  progresses: number[];
};

export default function ProductReviewDistribution({
  displayPercentages,
  isInView,
  isLoading,
  progresses,
}: ProductReviewDistributionProps) {
  const t = useTranslations('ProductReview.summary');

  return (
    <div className="space-y-4">
      {[5, 4, 3, 2, 1].map((star, idx) => (
        <div key={star} className="flex items-center gap-4">
          <span className="w-11 text-sm font-medium text-ink sm:text-base dark:text-surface">
            <span aria-hidden="true">{star}</span>
            <span className="sr-only">{t('starPoint', { star })}</span>
          </span>
          {isLoading ? (
            <ProductReviewProgressSkeleton />
          ) : (
            <ProgressBar
              progress={isInView ? progresses[idx] : 0}
              animateDelayMs={idx * 90}
              animateDurationMs={750}
              className="min-w-0 flex-1"
              trackClassName="bg-line dark:bg-dark-bg-hover"
              barClassName="bg-primary"
            />
          )}
          <span className="w-11 text-right text-sm font-medium text-muted sm:text-base dark:text-dark-muted">
            {isLoading ? '-' : `${displayPercentages[idx]}%`}
          </span>
        </div>
      ))}
    </div>
  );
}
