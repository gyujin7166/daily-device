import { IconStar } from '@tabler/icons-react';

import ReviewFormSection from './ReviewFormSection';

type ReviewFormRatingFieldProps = {
  rating: number;
  hovered: number | null;
  onRatingChange: (rating: number) => void;
  onHoverChange: (hovered: number | null) => void;
};

export default function ReviewFormRatingField({
  rating,
  hovered,
  onRatingChange,
  onHoverChange,
}: ReviewFormRatingFieldProps) {
  return (
    <ReviewFormSection label="만족도 평가" required>
      <div className="flex items-center justify-center py-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hovered ?? rating);

          return (
            <button
              key={star}
              type="button"
              onClick={() => {
                onRatingChange(star);
                onHoverChange(star);
              }}
              onMouseEnter={() => onHoverChange(star)}
              onMouseLeave={() => onHoverChange(null)}
              className="flex h-11 w-11 items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/35"
              aria-label={`${star}점 선택`}
              aria-pressed={rating === star}
            >
              <IconStar
                size={36}
                className={
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-line dark:text-dark-border'
                }
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted dark:text-dark-muted">
        {rating} / 5
      </p>
    </ReviewFormSection>
  );
}
