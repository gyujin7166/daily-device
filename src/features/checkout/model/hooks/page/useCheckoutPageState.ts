import { useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';


import { useCartContext } from '@entities/cart/model/context/CartContext';
import type { UserCartItem } from '@entities/cart/model/types';
import { useCart } from '@entities/cart/queries/useCart';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';
import type { CheckoutEntrySource } from '@shared/constants/checkout';
import { useRouter } from '@shared/lib/i18n/navigation';
import { useQueryParams } from '@shared/lib/router/useQueryParams';

import { parseBuyNowCartItems } from '../../buyNowCartItem';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { useCheckoutPayment } from '../payment/useCheckoutPayment';

type ResolvedCheckoutEntry = CheckoutEntrySource | 'direct';
type CheckoutViewState = 'loading' | 'empty' | 'checkout';

export default function useCheckoutPageState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const { setParam } = useQueryParams();
  const {
    setIsAddressModalOpen,
    setAddressModalMode,
    setEditingAddressId,
    isAddressModalOpen,
  } = useCheckoutContext();
  const { userCartItems } = useCartContext();
  const { isPending } = useCart();

  const [buyNowItems, setBuyNowItems] = useState<UserCartItem[]>([]);
  const [checkoutEntry, setCheckoutEntry] =
    useState<ResolvedCheckoutEntry | null>(null);
  const [isBuyNowHydrated, setIsBuyNowHydrated] = useState(false);
  const hasResolvedCheckoutEntryRef = useRef(false);
  const hasHydratedBuyNowItemsRef = useRef(false);
  const hasHandledAddressModeQueryRef = useRef(false);

  const orderNumber = params.get('orderNumber');
  const addressModeFromQuery = params.get('addressMode');

  const effectiveCheckoutItems =
    checkoutEntry === 'buyNow' ? buyNowItems : userCartItems;
  const {
    actionLabel,
    handlePay,
    isActionDisabled,
    isBusy,
    isCartSyncPending,
    selectedMethod,
    setSelectedMethod,
  } = useCheckoutPayment({
    items: effectiveCheckoutItems,
    isBuyNow: checkoutEntry === 'buyNow',
  });

  const totalQuantity = effectiveCheckoutItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const checkoutTotalPrice = effectiveCheckoutItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0,
  );
  const hasCheckoutItems = effectiveCheckoutItems.length > 0;
  const isBuyNowLoading = checkoutEntry === 'buyNow' && !isBuyNowHydrated;
  const isCartLoading =
    Boolean(checkoutEntry) && checkoutEntry !== 'buyNow' && isPending;
  const shouldRedirectFromFlowWhenEmpty =
    Boolean(checkoutEntry) &&
    !hasCheckoutItems &&
    !orderNumber &&
    !isCartLoading &&
    !isBuyNowLoading &&
    checkoutEntry !== 'direct';
  const checkoutViewState: CheckoutViewState =
    !checkoutEntry ||
    isCartLoading ||
    isBuyNowLoading ||
    shouldRedirectFromFlowWhenEmpty
      ? 'loading'
      : !hasCheckoutItems && !orderNumber && checkoutEntry === 'direct'
        ? 'empty'
        : 'checkout';

  const handleOpenAddressModal = () => {
    setEditingAddressId(null);
    setAddressModalMode('saved');
    setIsAddressModalOpen(true);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  /**
   * 결제 페이지는 cart, buyNow, 직접 접근을 모두 받는다.
   * entry 값은 새로고침 후에도 같은 checkout 흐름을 유지하기 위해 결제 완료 전까지 보존한다.
   */
  useEffect(() => {
    if (hasResolvedCheckoutEntryRef.current) {
      return;
    }

    hasResolvedCheckoutEntryRef.current = true;

    const rawEntry = window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY);
    const resolvedEntry: ResolvedCheckoutEntry =
      rawEntry === 'buyNow' || rawEntry === 'cart' ? rawEntry : 'direct';

    setCheckoutEntry(resolvedEntry);
  }, []);

  /**
   * buyNow 항목은 서버 장바구니에 없을 수 있으므로 sessionStorage에서 별도로 복원한다.
   * 결제 완료 전까지 유지해 새로고침해도 장바구니 항목으로 대체되지 않게 한다.
   */
  useEffect(() => {
    if (!checkoutEntry) {
      return;
    }

    if (hasHydratedBuyNowItemsRef.current) {
      return;
    }

    hasHydratedBuyNowItemsRef.current = true;

    if (checkoutEntry !== 'buyNow') {
      setBuyNowItems([]);
      window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY);
      setIsBuyNowHydrated(true);
      return;
    }

    const rawItems = window.sessionStorage.getItem(
      BUY_NOW_CHECKOUT_STORAGE_KEY,
    );
    setBuyNowItems(parseBuyNowCartItems(rawItems));

    setIsBuyNowHydrated(true);
  }, [checkoutEntry]);

  useEffect(() => {
    if (!shouldRedirectFromFlowWhenEmpty) {
      return;
    }

    router.replace('/my/orders');
  }, [router, shouldRedirectFromFlowWhenEmpty]);

  useEffect(() => {
    if (hasHandledAddressModeQueryRef.current) {
      return;
    }

    if (addressModeFromQuery !== 'new') {
      return;
    }

    hasHandledAddressModeQueryRef.current = true;

    if (hasCheckoutItems && !orderNumber) {
      setEditingAddressId(null);
      setAddressModalMode('new');
      setIsAddressModalOpen(true);
    }

    setParam('addressMode', null, true);
  }, [
    addressModeFromQuery,
    hasCheckoutItems,
    orderNumber,
    setParam,
    setAddressModalMode,
    setEditingAddressId,
    setIsAddressModalOpen,
  ]);

  return {
    isAddressModalOpen,
    orderNumber,
    hasCheckoutItems,
    totalQuantity,
    effectiveCheckoutItems,
    checkoutTotalPrice,
    isBuyNowRequested: checkoutEntry === 'buyNow',
    actionLabel,
    handlePay,
    isActionDisabled,
    isBusy,
    isCartSyncPending,
    selectedMethod,
    setSelectedMethod,
    checkoutViewState,
    handleOpenAddressModal,
    handleGoHome,
  };
}
