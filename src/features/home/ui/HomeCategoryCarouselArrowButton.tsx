import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type HomeCategoryCarouselArrowButtonProps = {
  direction: 'prev' | 'next';
  isVisible: boolean;
  disabled: boolean;
  onClick: () => void;
};

export default function HomeCategoryCarouselArrowButton({
  direction,
  isVisible,
  disabled,
  onClick,
}: HomeCategoryCarouselArrowButtonProps) {
  const t = useTranslations('Home.category');

  if (!isVisible) {
    return null;
  }

  const Icon = direction === 'prev' ? IconChevronLeft : IconChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        direction === 'prev' ? t('previousSlide') : t('nextSlide')
      }
      className={cn(
        'absolute top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-lg backdrop-blur-sm transition-[background-color,color,opacity,transform] duration-200 hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-40 lg:flex dark:border-dark-border dark:bg-dark-bg/90 dark:text-surface dark:hover:bg-dark-bg-hover',
        direction === 'prev'
          ? 'left-3 hover:-translate-x-0.5 lg:-left-18 xl:-left-20'
          : 'right-3 hover:translate-x-0.5 lg:-right-18 xl:-right-20',
      )}
    >
      <Icon size={26} stroke={1.4} />
    </button>
  );
}
