import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { selectCartItems, useCart } from '@entities/cart/queries/useCart';

import CartContent from './CartContent';
import CartDrawerPanel from './CartDrawerPanel';
import CartError from './CartError';
import CartFooter from './CartFooter';
import CartHeader from './CartHeader';
import CartSkeleton from './CartSkeleton';

type PendingAddingCartSkeletonProps = {
  isAuthenticated: boolean;
};

function PendingAddingCartSkeleton({
  isAuthenticated,
}: PendingAddingCartSkeletonProps) {
  const pendingAddingItemCount = useCartPendingStore(
    (state) => Object.keys(state.pendingAddingItemKeys).length,
  );

  if (!isAuthenticated || pendingAddingItemCount === 0) {
    return null;
  }

  return <CartSkeleton itemCount={pendingAddingItemCount} />;
}

export default function CartDrawer() {
  const localCartItems = useCartLocalStore((state) => state.localCartItems);
  const { data: userCartItems = [], isFetched } = useCart({
    select: selectCartItems,
  });
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
            <PendingAddingCartSkeleton isAuthenticated={isAuthenticated} />
          </ul>
        </div>
        <CartError />
        <CartFooter />
      </CartDrawerPanel>
    </div>
  );
}
