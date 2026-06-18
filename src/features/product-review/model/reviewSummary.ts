export type ProductReviewSummary = {
  safeTotalReviews: number;
  safeAverageRating: number;
  hasReviews: boolean;
  fullStarCount: number;
  hasHalfStar: boolean;
  emptyStarCount: number;
  progresses: number[];
  displayPercentages: number[];
};

const EMPTY_RATING_VALUES = [0, 0, 0, 0, 0];

export const getProductReviewSummary = ({
  totalReviews = 0,
  averageRating = 0,
  ratingCounts = EMPTY_RATING_VALUES,
}: {
  totalReviews?: number;
  averageRating?: number;
  ratingCounts?: number[];
}): ProductReviewSummary => {
  const safeTotalReviews = Math.max(0, Math.floor(totalReviews));
  const safeAverageRating = Math.max(0, Math.min(5, averageRating));
  const hasReviews = safeTotalReviews > 0;
  const roundedAverageRating = Math.round(safeAverageRating * 2) / 2;
  const fullStarCount = Math.floor(roundedAverageRating);
  const hasHalfStar = roundedAverageRating - fullStarCount >= 0.5;
  const emptyStarCount = Math.max(0, 5 - fullStarCount - (hasHalfStar ? 1 : 0));
  const counts =
    ratingCounts.length === 5
      ? ratingCounts.map((count) => Math.max(0, Math.floor(count)))
      : EMPTY_RATING_VALUES;
  const rawPercentages =
    safeTotalReviews > 0
      ? counts.map((count) => (count / safeTotalReviews) * 100)
      : EMPTY_RATING_VALUES;
  const progresses =
    safeTotalReviews > 0
      ? rawPercentages.map((value) => Math.round(value * 10) / 10)
      : EMPTY_RATING_VALUES;

  return {
    safeTotalReviews,
    safeAverageRating,
    hasReviews,
    fullStarCount,
    hasHalfStar,
    emptyStarCount,
    progresses,
    displayPercentages: getDisplayPercentages(safeTotalReviews, rawPercentages),
  };
};

const getDisplayPercentages = (
  safeTotalReviews: number,
  rawPercentages: number[],
) => {
  if (safeTotalReviews <= 0) {
    return EMPTY_RATING_VALUES;
  }

  const floored = rawPercentages.map((value) => Math.floor(value));
  let remain = 100 - floored.reduce((sum, value) => sum + value, 0);

  const rankedByFraction = rawPercentages
    .map((value, idx) => ({ idx, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < rankedByFraction.length && remain > 0; i += 1) {
    floored[rankedByFraction[i].idx] += 1;
    remain -= 1;
  }

  return floored;
};
