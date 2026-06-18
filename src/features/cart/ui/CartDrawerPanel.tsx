import { useEffect, useRef } from 'react';

import { Transition } from 'react-transition-group';

import { useCartContext } from '@entities/cart/model/context/CartContext';

import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';
import type { TransitionStyle } from '@shared/types/transition';

type CartDrawerPanelProps = {
  children: React.ReactNode;
};

const DURATION = 150;
const DEFAULT_STYLE = {
  transition: `transform ${DURATION}ms ease-in`,
};
const TRANSITION_STYLES: TransitionStyle = {
  entering: {
    transform: 'translateX(0px)',
  },
  entered: {
    transform: 'translateX(0px)',
  },
  exiting: {
    transform: 'translateX(100%)',
  },
  exited: {
    transform: 'translateX(100%)',
  },
};

export default function CartDrawerPanel({ children }: CartDrawerPanelProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { isCartOpen, closeCart } = useCartContext();

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const root = document.documentElement;
    const previousScrollbarGutter = root.style.scrollbarGutter;

    root.style.scrollbarGutter = 'auto';

    return () => {
      root.style.scrollbarGutter = previousScrollbarGutter;
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        nodeRef.current &&
        event.target instanceof Node &&
        nodeRef.current.contains(event.target)
      ) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest('[data-cart-trigger="true"]')
      ) {
        return;
      }

      if (isCartOpen) {
        closeCart();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [closeCart, isCartOpen]);

  return (
    <Transition
      nodeRef={nodeRef}
      in={isCartOpen}
      timeout={DURATION}
      unmountOnExit
      className="overflow-hidden"
    >
      {(state) => (
        <div
          ref={nodeRef}
          className={cn(
            'fixed top-0 right-0 h-full w-full border-0 border-line bg-canvas shadow-2xl sm:w-[92vw] sm:max-w-125 sm:border-l dark:border-dark-border dark:bg-dark-bg',
            isCartOpen && 'z-50',
          )}
          style={{
            ...DEFAULT_STYLE,
            ...getTransitionStyle(TRANSITION_STYLES, state),
          }}
        >
          <div className="flex h-full flex-col text-base">{children}</div>
        </div>
      )}
    </Transition>
  );
}
