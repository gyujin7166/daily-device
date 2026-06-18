import { useRef, useState } from 'react';

import { IconCheck, IconMinus, IconPlus } from '@tabler/icons-react';
import { Transition } from 'react-transition-group';

import type { ProductColorFilterOption } from '@entities/product/model/types';

import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';

import {
  PRODUCT_FILTER_SECTION_DEFAULT_STYLE,
  PRODUCT_FILTER_SECTION_TRANSITION_DURATION,
  PRODUCT_FILTER_SECTION_TRANSITION_STYLES,
} from '../model/productFilter';

import type { ProductFilterVariant } from '../model/productFilter';

type ProductColorFilterSectionProps = {
  colorOptions: ProductColorFilterOption[];
  selectedColorIds: number[];
  onChange: (nextColorIds: number[]) => void;
  sectionTitleClassName: string;
  variant: ProductFilterVariant;
  containerClassName?: string;
};

export default function ProductColorFilterSection({
  colorOptions,
  selectedColorIds,
  onChange,
  sectionTitleClassName,
  variant,
  containerClassName,
}: ProductColorFilterSectionProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const selectedColorIdSet = new Set(selectedColorIds);
  const optionLabelClassName =
    variant === 'drawer'
      ? 'text-base text-ink dark:text-surface'
      : 'text-sm text-ink dark:text-surface';

  if (colorOptions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        containerClassName ??
          'border-t border-line py-4 first:border-t-0 first:pt-0 dark:border-dark-border',
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setIsClosed((prev) => !prev)}
      >
        <p className={sectionTitleClassName}>색상</p>
        {isClosed ? (
          <IconPlus size={16} className="text-muted dark:text-dark-muted" />
        ) : (
          <IconMinus size={16} className="text-muted dark:text-dark-muted" />
        )}
      </button>

      <Transition
        nodeRef={nodeRef}
        in={!isClosed}
        timeout={PRODUCT_FILTER_SECTION_TRANSITION_DURATION}
        unmountOnExit
      >
        {(state) => (
          <div
            ref={nodeRef}
            className="grid overflow-hidden"
            style={{
              ...PRODUCT_FILTER_SECTION_DEFAULT_STYLE,
              ...getTransitionStyle(
                PRODUCT_FILTER_SECTION_TRANSITION_STYLES,
                state,
              ),
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className="space-y-2 pt-3">
                {colorOptions.map((color) => {
                  const isSelected = selectedColorIdSet.has(color.id);
                  const nextColorIds = isSelected
                    ? selectedColorIds.filter((colorId) => colorId !== color.id)
                    : [...selectedColorIds, color.id];

                  return (
                    <li key={color.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onChange(nextColorIds)}
                        className="group flex w-full items-center gap-3 rounded-2xl py-1.5 text-left transition-colors hover:text-primary"
                      >
                        <span
                          className={cn(
                            'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                            isSelected
                              ? 'border-primary border-2'
                              : 'border-line dark:border-dark-border',
                          )}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected ? (
                            <IconCheck
                              size={12}
                              stroke={2.7}
                              className="text-surface drop-shadow-sm"
                            />
                          ) : null}
                        </span>
                        <span className={optionLabelClassName}>
                          {color.name}
                        </span>
                      </button>
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
