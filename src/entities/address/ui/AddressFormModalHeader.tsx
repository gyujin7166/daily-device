import { IconX } from '@tabler/icons-react';

type AddressFormModalHeaderProps = {
  title: string;
  description: string;
  isSaving: boolean;
  onClose: () => void;
};

export default function AddressFormModalHeader({
  title,
  description,
  isSaving,
  onClose,
}: AddressFormModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
      <div>
        <h3 className="text-2xl font-semibold leading-[1.2] tracking-[-0.015em] text-ink sm:text-2xl dark:text-surface">
          {title}
        </h3>
        <p className="mt-1 text-base text-muted sm:text-base sm:leading-5 dark:text-dark-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-canvas hover:text-ink sm:h-9 sm:w-9 dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
        aria-label="배송지 모달 닫기"
        disabled={isSaving}
      >
        <IconX size={24} />
      </button>
    </div>
  );
}
