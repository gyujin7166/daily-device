import type { PropsWithChildren } from 'react';

import CartProvider from '@entities/cart/model/context/CartContext';

import LogoHeader from '@shared/ui/Header/LogoHeader';

type CheckoutLayoutProps = PropsWithChildren;

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-surface text-ink dark:bg-dark-bg dark:text-surface">
        <LogoHeader />
        {children}
      </div>
    </CartProvider>
  );
}
