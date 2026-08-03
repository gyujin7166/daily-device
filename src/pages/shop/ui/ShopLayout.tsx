'use client';
import type React from 'react';

import CartDrawer from '@features/cart/ui';
import CartOverlay from '@features/cart/ui/CartOverlay';

import CartStateSynchronizer from '@entities/cart/ui/CartStateSynchronizer';

import { NavBar } from '@widgets/navigation/ui';

import Footer from './Footer';

type ShopLayoutProps = React.PropsWithChildren;

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <CartStateSynchronizer />
      <div data-shop-chrome>
        <NavBar />
      </div>
      <main className="flex flex-1 flex-col">{children}</main>
      <div data-shop-chrome>
        <CartDrawer />
        <CartOverlay />
      </div>
      <div data-shop-chrome>
        <Footer />
      </div>
    </div>
  );
}
