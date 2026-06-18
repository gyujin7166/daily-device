import { cn } from '@shared/lib/utils/style';
import SortDropdownOptionList from '@shared/ui/SortDropdown/SortDropdownOptionList';
import type { SortDropdownOption } from '@shared/ui/SortDropdown/SortDropdownOptionList';

type SortDropdownDesktopMenuProps<T extends string> = {
  value: T;
  options: ReadonlyArray<SortDropdownOption<T>>;
  isOpen: boolean;
  menuWidthClassName: string;
  prefixLabel: string;
  onSelect: (nextValue: T) => void;
};

export default function SortDropdownDesktopMenu<T extends string>({
  value,
  options,
  isOpen,
  menuWidthClassName,
  prefixLabel,
  onSelect,
}: SortDropdownDesktopMenuProps<T>) {
  return (
    <div
      className={cn(
        'absolute right-0 top-full z-80 mt-3',
        menuWidthClassName,
        'rounded-2xl border border-line bg-surface p-2 shadow-2xl transition duration-200 ease-out dark:border-dark-border dark:bg-dark-bg',
        isOpen
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0',
      )}
    >
      <SortDropdownOptionList
        value={value}
        options={options}
        prefixLabel={prefixLabel}
        optionSize="sm"
        onSelect={onSelect}
      />
    </div>
  );
}
