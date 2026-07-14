import { IconArrowsSort, IconChevronDown } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

type SortDropdownTriggerProps = {
  disabled: boolean;
  isMobileSheetMode: boolean;
  isOpen: boolean;
  prefixLabel: string;
  triggerLabel: string;
  selectedLabel: string;
  selectedLabelClassName: string;
  triggerClassName: string;
  onToggle: () => void;
};

export default function SortDropdownTrigger({
  disabled,
  isMobileSheetMode,
  isOpen,
  prefixLabel,
  triggerLabel,
  selectedLabel,
  selectedLabelClassName,
  triggerClassName,
  onToggle,
}: SortDropdownTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover',
        triggerClassName,
      )}
      aria-label={triggerLabel}
      aria-expanded={isOpen}
      aria-haspopup={isMobileSheetMode ? 'dialog' : 'listbox'}
    >
      <IconArrowsSort size={14} stroke={2.1} />
      <span className="text-muted dark:text-dark-muted">{prefixLabel}:</span>
      <span
        className={cn('text-ink dark:text-surface', selectedLabelClassName)}
      >
        {selectedLabel}
      </span>
      <IconChevronDown
        size={14}
        className={cn(
          'text-muted transition-transform duration-200 dark:text-dark-muted',
          isOpen ? 'rotate-180' : '',
        )}
      />
    </button>
  );
}
