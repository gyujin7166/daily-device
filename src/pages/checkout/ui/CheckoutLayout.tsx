import type { PropsWithChildren } from 'react';

import CartStateSynchronizer from '@entities/cart/ui/CartStateSynchronizer';

import LogoHeader from '@shared/ui/Header/LogoHeader';

type CheckoutLayoutProps = PropsWithChildren;

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink dark:bg-dark-bg dark:text-surface">
      <CartStateSynchronizer />
      <LogoHeader />
      {children}
    </div>
  );
}
