import type { ReactNode, RefObject } from 'react';

import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Transition } from 'react-transition-group';

import type { TablerIcon } from '@tabler/icons-react';

type ProductDetailAccordionItemProps = {
  sectionKey: string;
  titleId: number;
  label: string;
  Icon?: TablerIcon;
  isOpen: boolean;
  expandedHeight: number;
  transitionRef: RefObject<HTMLDivElement | null>;
  contentRefs: RefObject<Record<string, HTMLDivElement | null>>;
  onToggle: (titleId: number) => void;
  onUpdateContentHeight: (
    sectionKey: string,
    node?: HTMLDivElement | null,
  ) => void;
  children: ReactNode;
};

const TRANSITION_DURATION = 460;
const defaultStyle = {
  transition: `max-height ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${Math.max(TRANSITION_DURATION - 120, 220)}ms ease`,
  maxHeight: 0,
  opacity: 0,
  willChange: 'max-height, opacity',
};

export default function ProductDetailAccordionItem({
  sectionKey,
  titleId,
  label,
  Icon,
  isOpen,
  expandedHeight,
  transitionRef,
  contentRefs,
  onToggle,
  onUpdateContentHeight,
  children,
}: ProductDetailAccordionItemProps) {
  return (
    <div className="border-b border-line dark:border-dark-border">
      <button
        onClick={() => onToggle(titleId)}
        className="flex w-full items-center py-4.5 text-left"
        type="button"
        aria-expanded={isOpen}
      >
        <span className="inline-flex items-center gap-2.5">
          {Icon ? (
            <Icon
              size={20}
              stroke={1.8}
              className="text-primary dark:text-primary"
            />
          ) : null}
          <span className="text-xl font-semibold leading-[1.2] text-ink dark:text-surface">
            {label}
          </span>
        </span>
        <span className="ml-auto text-ink dark:text-surface">
          {isOpen ? (
            <IconMinus size={20} stroke={1.8} />
          ) : (
            <IconPlus size={20} stroke={1.8} />
          )}
        </span>
      </button>

      <Transition<HTMLDivElement>
        nodeRef={transitionRef}
        in={isOpen}
        timeout={TRANSITION_DURATION}
        unmountOnExit
        onEnter={() => onUpdateContentHeight(sectionKey)}
        onEntered={() => onUpdateContentHeight(sectionKey)}
      >
        {(state) => (
          <div
            ref={transitionRef}
            className="overflow-hidden"
            style={{
              ...defaultStyle,
              maxHeight:
                state === 'entering' || state === 'entered'
                  ? `${expandedHeight}px`
                  : '0px',
              opacity: state === 'entering' || state === 'entered' ? 1 : 0,
            }}
          >
            <div
              ref={(node) => {
                contentRefs.current[sectionKey] = node;
              }}
              className="min-h-0 overflow-hidden pb-5"
            >
              {children}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}
