import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

type HomeCategoryCarouselArrowButtonProps = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
};

export default function HomeCategoryCarouselArrowButton({
  direction,
  disabled,
  onClick,
}: HomeCategoryCarouselArrowButtonProps) {
  const t = useTranslations('Home.category');
  const Icon = direction === 'prev' ? IconChevronLeft : IconChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? t('previousSlide') : t('nextSlide')}
      className="flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-surface disabled:hover:text-ink dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover dark:disabled:hover:bg-dark-panel"
    >
      <Icon size={20} stroke={1.6} />
    </button>
  );
}
