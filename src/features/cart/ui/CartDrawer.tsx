import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartContext } from '@entities/cart/model/context/CartContext';
import { useCart } from '@entities/cart/queries/useCart';

import CartContent from './CartContent';
import CartDrawerPanel from './CartDrawerPanel';
import CartError from './CartError';
import CartFooter from './CartFooter';
import CartHeader from './CartHeader';
import CartSkeleton from './CartSkeleton';

export default function CartDrawer() {
  const { userCartItems, localCartItems, pendingAddingItemCount } =
    useCartContext();
  const { isFetched } = useCart();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';
  const cartItems = isAuthenticated
    ? userCartItems
    : isUnauthenticated
      ? localCartItems
      : [];
  const itemKeyPrefix = isAuthenticated ? 'user' : 'local';
  const shouldShowInitialSkeleton =
    status === 'loading' || (isAuthenticated && !isFetched);
  const shouldShowAddingSkeleton =
    isAuthenticated && pendingAddingItemCount > 0;

  return (
    <div className="z-50">
      <CartDrawerPanel>
        <CartHeader />
        <div className="scrollbar-soft w-full flex-1 overflow-y-auto overscroll-contain bg-canvas px-5 py-5 dark:bg-dark-bg">
          <ul className="space-y-4">
            {shouldShowInitialSkeleton ? <CartSkeleton itemCount={3} /> : null}
            {cartItems.map((item) => (
              <CartContent
                key={`${itemKeyPrefix}-${'id' in item ? item.id : getCartVariantKey(item)}-${getCartVariantKey(item)}`}
                item={item}
              />
            ))}
            {shouldShowAddingSkeleton ? (
              <CartSkeleton itemCount={pendingAddingItemCount} />
            ) : null}
          </ul>
        </div>
        <CartError />
        <CartFooter />
      </CartDrawerPanel>
    </div>
  );
}
