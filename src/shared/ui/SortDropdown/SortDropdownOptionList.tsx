import { IconCheck } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

export type SortDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type SortDropdownOptionListProps<T extends string> = {
  value: T;
  options: ReadonlyArray<SortDropdownOption<T>>;
  listLabel: string;
  optionSize: 'sm' | 'md';
  onSelect: (nextValue: T) => void;
};

export default function SortDropdownOptionList<T extends string>({
  value,
  options,
  listLabel,
  optionSize,
  onSelect,
}: SortDropdownOptionListProps<T>) {
  const isLarge = optionSize === 'md';

  return (
    <div role="listbox" aria-label={listLabel} className="grid gap-1">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 font-medium transition',
              isLarge ? 'py-3 text-base' : 'py-2 text-sm',
              isSelected
                ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary'
                : 'text-ink dark:text-surface hover:bg-primary-soft hover:text-primary dark:hover:bg-primary-soft dark:hover:text-primary',
            )}
            onClick={() => onSelect(option.value)}
          >
            <span>{option.label}</span>
            {isSelected ? <IconCheck size={isLarge ? 18 : 16} /> : null}
          </button>
        );
      })}
    </div>
  );
}
