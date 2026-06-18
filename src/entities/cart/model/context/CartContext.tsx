'use client';
import type { SetStateAction } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { usePathname } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import type { LocalCartItem, UserCartItem } from '@entities/cart/model/types';
import type { CartResponse } from '@entities/cart/model/types';
import { useCart } from '@entities/cart/queries/useCart';

import { useScrollLock } from '@shared/hooks/useScrollLock';

import useMergeLocalCart from '../hooks/useMergeLocalCart';

const EMPTY_USER_CART_ITEMS: UserCartItem[] = [];

type CartContextType = {
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  userCart: CartResponse | undefined;
  userCartItems: UserCartItem[];
  localCartItems: LocalCartItem[];
  setLocalCartItems: React.Dispatch<SetStateAction<LocalCartItem[]>>;
  userTotalPrice: number;
  localTotalPrice: number;
  quantities: Record<string, number>;
  setQuantities: React.Dispatch<SetStateAction<Record<string, number>>>;
  isAddingNewItem: boolean;
  pendingAddingItemCount: number;
  startAddingNewItem: (variantKey: string) => void;
  finishAddingNewItem: (variantKey: string) => void;
  isCartVariantAdding: (variantKey: string) => boolean;
  isCartSyncPending: boolean;
  startCartSync: (variantKey: string) => void;
  finishCartSync: (variantKey: string) => void;
  isCartVariantSyncPending: (variantKey: string) => boolean;
  isCartVariantMutationPending: (variantKey: string) => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartContextProvider');
  }

  return context;
};

export default function CartProvider({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [localCartItems, setLocalCartItems] = useState<LocalCartItem[]>([]);
  const [pendingAddingItemKeys, setPendingAddingItemKeys] = useState<
    Record<string, true>
  >({});
  const [pendingCartSyncKeys, setPendingCartSyncKeys] = useState<
    Record<string, true>
  >({});
  const pendingAddingItemKeysRef = useRef<Record<string, true>>({});
  const pendingCartSyncKeysRef = useRef<Record<string, true>>({});
  const isMergingLocalCartRef = useRef(false);
  const mergedUserIdRef = useRef<string | null>(null);
  const { mergeLocalCart } = useMergeLocalCart();
  const { data: userCart, isFetched: isUserCartFetched } = useCart();
  useScrollLock(isCartOpen);

  const userCartItems = userCart?.items ?? EMPTY_USER_CART_ITEMS;
  const userTotalPrice = userCartItems
    ? userCartItems.reduce(
        (acc, item) => acc + item.quantity * item.product.price,
        0,
      )
    : 0;

  const localTotalPrice = localCartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const isCartSyncPending = Object.keys(pendingCartSyncKeys).length > 0;
  const pendingAddingItemCount = Object.keys(pendingAddingItemKeys).length;
  const isAddingNewItem = pendingAddingItemCount > 0;
  const routeKey = pathname ?? '';

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };
  const openCart = () => {
    setIsCartOpen(true);
  };
  const closeCart = () => {
    setIsCartOpen(false);
  };
  const startAddingNewItem = (variantKey: string) => {
    pendingAddingItemKeysRef.current = {
      ...pendingAddingItemKeysRef.current,
      [variantKey]: true,
    };
    setPendingAddingItemKeys((prev) =>
      prev[variantKey] ? prev : { ...prev, [variantKey]: true },
    );
  };
  const finishAddingNewItem = (variantKey: string) => {
    if (pendingAddingItemKeysRef.current[variantKey]) {
      const { [variantKey]: _removed, ...rest } =
        pendingAddingItemKeysRef.current;
      pendingAddingItemKeysRef.current = rest;
    }

    setPendingAddingItemKeys((prev) => {
      if (!prev[variantKey]) {
        return prev;
      }

      const { [variantKey]: _removed, ...rest } = prev;
      return rest;
    });
  };
  const startCartSync = (variantKey: string) => {
    pendingCartSyncKeysRef.current = {
      ...pendingCartSyncKeysRef.current,
      [variantKey]: true,
    };
    setPendingCartSyncKeys((prev) =>
      prev[variantKey] ? prev : { ...prev, [variantKey]: true },
    );
  };
  const finishCartSync = (variantKey: string) => {
    if (pendingCartSyncKeysRef.current[variantKey]) {
      const { [variantKey]: _removed, ...rest } =
        pendingCartSyncKeysRef.current;
      pendingCartSyncKeysRef.current = rest;
    }

    setPendingCartSyncKeys((prev) => {
      if (!prev[variantKey]) {
        return prev;
      }

      const { [variantKey]: _removed, ...rest } = prev;
      return rest;
    });
  };
  const isCartVariantAdding = useCallback(
    (variantKey: string) => Boolean(pendingAddingItemKeysRef.current[variantKey]),
    [],
  );
  const isCartVariantSyncPending = useCallback(
    (variantKey: string) => Boolean(pendingCartSyncKeysRef.current[variantKey]),
    [],
  );
  const isCartVariantMutationPending = useCallback(
    (variantKey: string) =>
      Boolean(
        pendingAddingItemKeysRef.current[variantKey] ||
          pendingCartSyncKeysRef.current[variantKey],
      ),
    [],
  );

  useEffect(() => {
    if (status === 'authenticated') {
      const initialQuantities = userCartItems.reduce(
        (acc, item) => ({
          ...acc,
          [getCartVariantKey(item)]: item.quantity,
        }),
        {} satisfies Record<string, number>,
      );
      setQuantities(initialQuantities);
    } else if (status === 'unauthenticated') {
      const localCartItems = localStorage.getItem('localCart');
      const parsedLocalCartItems: LocalCartItem[] = localCartItems
        ? JSON.parse(localCartItems)
        : [];
      setLocalCartItems(parsedLocalCartItems);
      const initialQuantities = parsedLocalCartItems.reduce(
        (acc, item) => ({
          ...acc,
          [getCartVariantKey(item)]: item.quantity,
        }),
        {} satisfies Record<string, number>,
      );
      setQuantities(initialQuantities);
    }
  }, [status, userCartItems]);

  useEffect(() => {
    setIsCartOpen(false);
  }, [routeKey]);

  useEffect(() => {
    if (status !== 'unauthenticated') {
      return;
    }

    if (localCartItems.length > 0) {
      localStorage.setItem('localCart', JSON.stringify(localCartItems));
      return;
    }

    localStorage.removeItem('localCart');
  }, [localCartItems, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user.id) {
      mergedUserIdRef.current = null;
      isMergingLocalCartRef.current = false;
      return;
    }

    if (!isUserCartFetched || isMergingLocalCartRef.current) {
      return;
    }

    if (mergedUserIdRef.current === session.user.id) {
      return;
    }

    const localCartItems = localStorage.getItem('localCart');
    const parsedLocalCartItems: LocalCartItem[] = localCartItems
      ? JSON.parse(localCartItems)
      : [];

    if (parsedLocalCartItems.length === 0) {
      mergedUserIdRef.current = session.user.id;
      return;
    }

    mergedUserIdRef.current = session.user.id;
    isMergingLocalCartRef.current = true;

    void mergeLocalCart(parsedLocalCartItems, setLocalCartItems, userCartItems)
      .catch(() => {
        mergedUserIdRef.current = null;
      })
      .finally(() => {
        isMergingLocalCartRef.current = false;
      });
  }, [
    isUserCartFetched,
    mergeLocalCart,
    session?.user.id,
    status,
    userCartItems,
  ]);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        toggleCart,
        openCart,
        closeCart,
        userCart,
        userCartItems,
        localCartItems,
        setLocalCartItems,
        userTotalPrice,
        localTotalPrice,
        quantities,
        setQuantities,
        isAddingNewItem,
        pendingAddingItemCount,
        startAddingNewItem,
        finishAddingNewItem,
        isCartVariantAdding,
        isCartSyncPending,
        startCartSync,
        finishCartSync,
        isCartVariantSyncPending,
        isCartVariantMutationPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
