import { IconChevronLeft, IconX } from '@tabler/icons-react';

type ReviewGalleryDetailMobileHeaderProps = {
  canReturnToGallery: boolean;
  onCloseDetail: () => void;
  onCloseModal: () => void;
};

export default function ReviewGalleryDetailMobileHeader({
  canReturnToGallery,
  onCloseDetail,
  onCloseModal,
}: ReviewGalleryDetailMobileHeaderProps) {
  return (
    <div className="relative z-10 flex items-center justify-between border-b border-line bg-surface px-3 py-2 lg:hidden dark:border-dark-border dark:bg-dark-panel">
      {canReturnToGallery ? (
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-line/70 bg-surface/95 px-3 text-xs font-medium text-ink shadow-xs transition-colors hover:bg-primary-soft dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
          onClick={onCloseDetail}
          aria-label="사진 후기로 돌아가기"
        >
          <IconChevronLeft size={16} />
          <span>사진 후기로</span>
        </button>
      ) : (
        <span />
      )}

      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-surface/95 text-muted shadow-xs transition-colors hover:text-ink dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:text-surface"
        onClick={onCloseModal}
        aria-label="사진 후기 모달 닫기"
      >
        <IconX size={20} />
      </button>
    </div>
  );
}
