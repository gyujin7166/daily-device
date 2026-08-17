import { useTranslations } from 'next-intl';

import SortDropdownDesktopMenu from '@shared/ui/SortDropdown/SortDropdownDesktopMenu';
import SortDropdownMobileSheet from '@shared/ui/SortDropdown/SortDropdownMobileSheet';
import type { SortDropdownOption } from '@shared/ui/SortDropdown/SortDropdownOptionList';
import SortDropdownTrigger from '@shared/ui/SortDropdown/SortDropdownTrigger';
import useSortDropdownState from '@shared/ui/SortDropdown/useSortDropdownState';

type SortDropdownProps<T extends string> = {
  value: T;
  options: ReadonlyArray<SortDropdownOption<T>>;
  onChange: (nextValue: T) => void;
  disabled?: boolean;
  menuWidthClassName?: string;
  mobileSheetOnMobile?: boolean;
  mobileSheetTitle?: string;
};

const SortDropdown = <T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  menuWidthClassName = 'w-50',
  mobileSheetOnMobile = false,
  mobileSheetTitle,
}: SortDropdownProps<T>) => {
  const t = useTranslations('Common.sortDropdown');
  const { containerRef, isMobileSheetMode, isOpen, setIsOpen } =
    useSortDropdownState({
      disabled,
      mobileSheetOnMobile,
    });
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? '';
  const prefixLabel = t('prefix');
  const resolvedMobileSheetTitle = mobileSheetTitle ?? t('mobileSheetTitle');

  const handleSelect = (nextValue: T) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <SortDropdownTrigger
        disabled={disabled}
        isMobileSheetMode={isMobileSheetMode}
        isOpen={isOpen}
        prefixLabel={prefixLabel}
        triggerLabel={t('changeLabel', { label: prefixLabel })}
        selectedLabel={selectedLabel}
        onToggle={() => setIsOpen((prev) => !prev)}
      />

      {isMobileSheetMode ? (
        <SortDropdownMobileSheet
          value={value}
          options={options}
          isOpen={isOpen}
          mobileSheetTitle={resolvedMobileSheetTitle}
          listLabel={t('optionsLabel', { label: prefixLabel })}
          closeLabel={t('closeSheet')}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
        />
      ) : (
        <SortDropdownDesktopMenu
          value={value}
          options={options}
          isOpen={isOpen}
          menuWidthClassName={menuWidthClassName}
          listLabel={t('optionsLabel', { label: prefixLabel })}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default SortDropdown;
