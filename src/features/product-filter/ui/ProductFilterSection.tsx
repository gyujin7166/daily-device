import { useRef } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';

import { IconCheck, IconMinus, IconPlus } from '@tabler/icons-react';
import { Transition } from 'react-transition-group';

import type { FilterWithOptions } from '@entities/product/model/types';

import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';
import type { TransitionStyle } from '@shared/types/transition';

type ProductFilterSectionProps = {
  filter: FilterWithOptions;
  isClosed: boolean;
  onToggle: (id: number) => void;
  inputIdPrefix: string;
  effectiveCheckboxStates: Record<number, boolean>;
  onCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void;
  sectionTitleClassName: string;
  optionLabelClassName: string;
  containerClassName?: string;
  duration: number;
  defaultStyle: CSSProperties;
  transitionStyles: TransitionStyle;
};

export default function ProductFilterSection({
  filter,
  isClosed,
  onToggle,
  inputIdPrefix,
  effectiveCheckboxStates,
  onCheckboxChange,
  sectionTitleClassName,
  optionLabelClassName,
  containerClassName,
  duration,
  defaultStyle,
  transitionStyles,
}: ProductFilterSectionProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const filterOptions = [...(filter.filterOption ?? [])].sort(
    (a, b) => a.id - b.id,
  );

  return (
    <div
      className={cn(
        containerClassName ??
          'border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0 dark:border-dark-border',
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => onToggle(filter.id)}
      >
        <p className={sectionTitleClassName}>{filter.name}</p>
        {isClosed ? (
          <IconPlus size={16} className="text-muted dark:text-dark-muted" />
        ) : (
          <IconMinus size={16} className="text-muted dark:text-dark-muted" />
        )}
      </button>
      <Transition
        nodeRef={nodeRef}
        in={!isClosed}
        timeout={duration}
        unmountOnExit
      >
        {(state) => (
          <div
            ref={nodeRef}
            className="grid overflow-hidden"
            style={{
              ...defaultStyle,
              ...getTransitionStyle(transitionStyles, state),
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className="pt-3">
                {filterOptions.map((option) => {
                  const optionId = `${option.id}`;
                  const checkboxId = `${inputIdPrefix}-${option.id}`;
                  const isChecked = effectiveCheckboxStates[option.id] || false;

                  return (
                    <li key={option.id} className="flex items-center py-1.5">
                      <label
                        htmlFor={checkboxId}
                        className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center"
                      >
                        <input
                          id={checkboxId}
                          type="checkbox"
                          value={optionId}
                          checked={isChecked}
                          onChange={onCheckboxChange}
                          className="peer sr-only"
                        />
                        <span className="h-5 w-5 rounded-full border border-muted bg-surface transition-colors peer-checked:border-primary peer-checked:bg-primary dark:bg-dark-panel-deep" />
                        <IconCheck
                          size={13}
                          stroke={2.5}
                          className="pointer-events-none absolute text-surface opacity-0 transition-opacity peer-checked:opacity-100"
                        />
                      </label>
                      <label
                        htmlFor={checkboxId}
                        className={optionLabelClassName}
                      >
                        {option.name_ko}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}
