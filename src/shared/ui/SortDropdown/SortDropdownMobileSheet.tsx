import { IconX } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';
import SortDropdownOptionList from '@shared/ui/SortDropdown/SortDropdownOptionList';
import type { SortDropdownOption } from '@shared/ui/SortDropdown/SortDropdownOptionList';

type SortDropdownMobileSheetProps<T extends string> = {
  value: T;
  options: ReadonlyArray<SortDropdownOption<T>>;
  isOpen: boolean;
  mobileSheetTitle: string;
  listLabel: string;
  closeLabel: string;
  onClose: () => void;
  onSelect: (nextValue: T) => void;
};

export default function SortDropdownMobileSheet<T extends string>({
  value,
  options,
  isOpen,
  mobileSheetTitle,
  listLabel,
  closeLabel,
  onClose,
  onSelect,
}: SortDropdownMobileSheetProps<T>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-230 md:hidden',
        isOpen ? '' : 'pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={mobileSheetTitle}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/45 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-200 dark:border-dark-border dark:bg-dark-panel',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-ink dark:text-surface">
            {mobileSheetTitle}
          </p>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
          >
            <IconX size={18} />
          </button>
        </div>

        <SortDropdownOptionList
          value={value}
          options={options}
          listLabel={listLabel}
          optionSize="md"
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
