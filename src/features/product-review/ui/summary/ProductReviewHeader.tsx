import { useEffect, useRef, useState } from 'react';

import { getProductReviewSummary } from '../../model/reviewSummary';

import ProductReviewDistribution from './ProductReviewDistribution';
import ProductReviewScoreSummary from './ProductReviewScoreSummary';

type ProductReviewProps = {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  totalReviews?: number;
  averageRating?: number;
  ratingCounts?: number[];
  isLoading?: boolean;
};

export default function ProductReviewHeader({
  scrollRef,
  totalReviews = 0,
  averageRating = 0,
  ratingCounts = [0, 0, 0, 0, 0],
  isLoading = false,
}: ProductReviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [animatedRating, setAnimatedRating] = useState(0);
  const summary = getProductReviewSummary({
    totalReviews,
    averageRating,
    ratingCounts,
  });
  const displayRating = isInView ? animatedRating : 0;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const duration = 800;
    const start = performance.now();
    setAnimatedRating(0);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(Math.max(elapsed / duration, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextRating = Math.min(
        Math.max(summary.safeAverageRating * eased, 0),
        summary.safeAverageRating,
      );
      setAnimatedRating(nextRating);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedRating(summary.safeAverageRating);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [summary.safeAverageRating, isInView]);

  return (
    <div className="pt-10 sm:pt-12" ref={scrollRef ? scrollRef : null}>
      <div ref={containerRef}>
        <div className="flex items-end justify-between border-b border-line pb-5 dark:border-dark-border">
          <div className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl dark:text-surface">
            상품평
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-[400px_minmax(0,1fr)] lg:gap-6">
          <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8 dark:border-dark-border dark:bg-dark-panel">
            <ProductReviewScoreSummary
              displayRating={displayRating}
              isLoading={isLoading}
              summary={summary}
            />
          </div>

          <div className="flex min-h-48 flex-col justify-center rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8 lg:px-10 dark:border-dark-border dark:bg-dark-panel">
            <ProductReviewDistribution
              displayPercentages={summary.displayPercentages}
              isInView={isInView}
              isLoading={isLoading}
              progresses={summary.progresses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
