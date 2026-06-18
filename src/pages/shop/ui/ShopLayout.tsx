'use client';
import type React from 'react';

import CartDrawer from '@features/cart/ui';
import CartOverlay from '@features/cart/ui/CartOverlay';

import CartProvider from '@entities/cart/model/context/CartContext';

import { NavBar } from '@widgets/navigation/ui';

import Footer from './Footer';

type ShopLayoutProps = React.PropsWithChildren;

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <CartProvider>
        <div data-shop-chrome>
          <NavBar />
        </div>
        <main className="flex-1">{children}</main>
        <div data-shop-chrome>
          <CartDrawer />
          <CartOverlay />
        </div>
      </CartProvider>
      <div data-shop-chrome>
        <Footer />
      </div>
    </div>
  );
}
