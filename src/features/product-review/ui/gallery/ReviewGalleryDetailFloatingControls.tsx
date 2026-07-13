import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

type ReviewGalleryDetailFloatingControlsProps = {
  canNavigateReview: boolean;
  canReturnToGallery: boolean;
  onCloseDetail: () => void;
  onCloseModal: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function ReviewGalleryDetailFloatingControls({
  canNavigateReview,
  canReturnToGallery,
  onCloseDetail,
  onCloseModal,
  onPrev,
  onNext,
}: ReviewGalleryDetailFloatingControlsProps) {
  const t = useTranslations('ProductReview.gallery');

  return (
    <>
      {canReturnToGallery ? (
        <button
          type="button"
          className="absolute left-3 top-3 z-40 hidden h-9 items-center gap-1 rounded-full border border-line/70 bg-surface/95 px-3 text-xs font-medium text-ink shadow-md transition-colors hover:bg-primary-soft lg:inline-flex lg:left-5 lg:top-5 lg:h-11 lg:gap-1.5 lg:px-4 lg:text-sm dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
          onClick={onCloseDetail}
          aria-label={t('backToGallery')}
        >
          <IconChevronLeft size={16} />
          <span>{t('backToGalleryLabel')}</span>
        </button>
      ) : null}

      <button
        type="button"
        className="absolute right-3 top-3 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-surface/95 text-muted shadow-md transition-colors hover:text-ink lg:inline-flex lg:-right-5 lg:-top-5 lg:h-11 lg:w-11 dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:text-surface"
        onClick={onCloseModal}
        aria-label={t('closeModal')}
      >
        <IconX size={20} />
      </button>

      {canNavigateReview ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-[31%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md transition-colors hover:bg-primary-soft lg:inline-flex lg:left-0 lg:top-1/2 lg:h-13 lg:w-13 lg:translate-x-[-150%] dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
            aria-label={t('previousReview')}
          >
            <IconChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 top-[31%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md transition-colors hover:bg-primary-soft lg:inline-flex lg:right-0 lg:top-1/2 lg:h-13 lg:w-13 lg:translate-x-[150%] dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
            aria-label={t('nextReview')}
          >
            <IconChevronRight size={22} />
          </button>
        </>
      ) : null}
    </>
  );
}
