import { IconArrowLeft, IconX } from '@tabler/icons-react';

type CheckoutSavedAddressModalHeaderProps = {
  onClose: () => void;
};

export default function CheckoutSavedAddressModalHeader({
  onClose,
}: CheckoutSavedAddressModalHeaderProps) {
  return (
    <div className="relative flex items-center justify-center bg-surface px-4 py-4 sm:justify-between sm:px-6 sm:py-5 dark:bg-dark-panel">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-canvas hover:text-ink sm:hidden dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
        aria-label="배송지 모달 닫기"
      >
        <IconArrowLeft size={24} />
      </button>
      <h3 className="text-2xl font-semibold leading-[1.2] tracking-[-0.015em] text-ink sm:hidden dark:text-surface">
        배송지 선택
      </h3>
      <h3 className="hidden text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:block dark:text-surface">
        배송지 선택
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-canvas hover:text-ink sm:inline-flex dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
        aria-label="배송지 모달 닫기"
      >
        <IconX size={24} />
      </button>
    </div>
  );
}
