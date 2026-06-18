import { IconArrowLeft } from '@tabler/icons-react';
import KakaoPostcodeEmbed from 'react-daum-postcode';

import type { Address } from 'react-daum-postcode';

type AddressFormPostcodeFieldProps = {
  label: string;
  required: boolean;
  onShowPostcodeChange: (isOpen: boolean) => void;
  onAddressComplete: (data: Address) => void;
};

export default function AddressFormPostcodeField({
  label,
  required,
  onShowPostcodeChange,
  onAddressComplete,
}: AddressFormPostcodeFieldProps) {
  const postCodeEmbedStyle = { width: '100%', height: '100%' };

  return (
    <div className="col-span-full flex flex-col items-start gap-2.5 sm:gap-2">
      <label
        className="flex items-center gap-1 text-base font-semibold leading-6 text-ink sm:text-sm dark:text-surface"
        htmlFor="address_1"
      >
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </label>
      <div className="w-full overflow-hidden rounded-xl border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
        <div className="relative h-105 sm:h-107.5">
          <button
            type="button"
            onClick={() => onShowPostcodeChange(false)}
            className="absolute right-2 top-2 z-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-muted transition hover:bg-canvas hover:text-ink sm:h-8 sm:w-8 dark:bg-dark-panel/90 dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
            aria-label="주소 입력으로 돌아가기"
          >
            <IconArrowLeft size={20} />
          </button>
          <div className="h-full [&>*]:h-full [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-w-none">
            <KakaoPostcodeEmbed
              style={postCodeEmbedStyle}
              onComplete={onAddressComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
