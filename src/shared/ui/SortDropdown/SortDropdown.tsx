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
  prefixLabel = '정렬',
  menuWidthClassName = 'w-50',
  triggerClassName = '',
  selectedLabelClassName = '',
  mobileSheetOnMobile = false,
  mobileSheetTitle = '정렬 기준 선택',
}: SortDropdownProps<T>) => {
  const { containerRef, isMobileSheetMode, isOpen, setIsOpen } =
    useSortDropdownState({
      disabled,
      mobileSheetOnMobile,
    });
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? '';

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
          mobileSheetTitle={mobileSheetTitle}
          prefixLabel={prefixLabel}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
        />
      ) : (
        <SortDropdownDesktopMenu
          value={value}
          options={options}
          isOpen={isOpen}
          menuWidthClassName={menuWidthClassName}
          prefixLabel={prefixLabel}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default SortDropdown;
