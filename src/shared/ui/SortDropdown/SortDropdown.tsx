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
  prefixLabel?: string;
  menuWidthClassName?: string;
  triggerClassName?: string;
  selectedLabelClassName?: string;
  mobileSheetOnMobile?: boolean;
  mobileSheetTitle?: string;
};

const SortDropdown = <T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  prefixLabel,
  menuWidthClassName = 'w-50',
  triggerClassName = '',
  selectedLabelClassName = '',
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
  const resolvedPrefixLabel = prefixLabel ?? t('prefix');
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
        prefixLabel={resolvedPrefixLabel}
        triggerLabel={t('changeLabel', { label: resolvedPrefixLabel })}
        selectedLabel={selectedLabel}
        selectedLabelClassName={selectedLabelClassName}
        triggerClassName={triggerClassName}
        onToggle={() => setIsOpen((prev) => !prev)}
      />

      {isMobileSheetMode ? (
        <SortDropdownMobileSheet
          value={value}
          options={options}
          isOpen={isOpen}
          mobileSheetTitle={resolvedMobileSheetTitle}
          listLabel={t('optionsLabel', { label: resolvedPrefixLabel })}
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
          listLabel={t('optionsLabel', { label: resolvedPrefixLabel })}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default SortDropdown;
