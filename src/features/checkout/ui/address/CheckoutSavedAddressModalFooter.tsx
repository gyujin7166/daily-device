import { IconMapPinPlus } from '@tabler/icons-react';

import Button from '@shared/ui/Button/Button';

type CheckoutSavedAddressModalFooterProps = {
  onSwitchToNewMode: () => void;
};

export default function CheckoutSavedAddressModalFooter({
  onSwitchToNewMode,
}: CheckoutSavedAddressModalFooterProps) {
  return (
    <div className="shrink-0 bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:px-6 sm:py-5 dark:bg-dark-panel">
      <Button
        type="button"
        variant="secondary"
        onClick={onSwitchToNewMode}
        className="h-14 w-full items-center justify-center gap-2 rounded-2xl !border-primary !bg-primary !text-base !font-semibold !leading-6 !text-surface shadow-[0_8px_18px_rgba(24,116,209,0.26)] enabled:hover:!border-primary-hover enabled:hover:!bg-primary-hover enabled:hover:!text-surface sm:h-13 sm:rounded-xl"
      >
        <IconMapPinPlus size={19} />새 배송지 추가
      </Button>
    </div>
  );
}
