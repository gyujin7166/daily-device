import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type HomeCategoryCarouselPaginationProps = {
  scrollSnaps: number[];
  selectedIndex: number;
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
  onScrollTo: (index: number) => void;
};

export default function HomeCategoryCarouselPagination({
  scrollSnaps,
  selectedIndex,
  prevBtnDisabled,
  nextBtnDisabled,
  onScrollPrev,
  onScrollNext,
  onScrollTo,
}: HomeCategoryCarouselPaginationProps) {
  const t = useTranslations('Home.category');

  if (scrollSnaps.length <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10">
      <button
        type="button"
        onClick={onScrollPrev}
        disabled={prevBtnDisabled}
        aria-label={t('previousSlide')}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-35 lg:hidden dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
      >
        <IconChevronLeft size={20} stroke={1.6} />
      </button>

      <div className="flex min-w-24 items-center justify-center gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => onScrollTo(index)}
            aria-label={t('goToSlide', { page: index + 1 })}
            aria-current={index === selectedIndex}
            className={cn(
              'size-3 rounded-full',
              index === selectedIndex
                ? 'bg-muted'
                : 'bg-line dark:bg-dark-bg-hover',
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onScrollNext}
        disabled={nextBtnDisabled}
        aria-label={t('nextSlide')}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-35 lg:hidden dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
      >
        <IconChevronRight size={20} stroke={1.6} />
      </button>
    </div>
  );
}
