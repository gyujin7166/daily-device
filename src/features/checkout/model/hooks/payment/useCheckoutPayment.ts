import { useState } from 'react';

import { useIsMutating } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useCartContext } from '@entities/cart/model/context/CartContext';
import type { UserCartItem } from '@entities/cart/model/types';
import { cartMutationKeys } from '@entities/cart/queries/queryKeys';
import { useCreateOrder } from '@entities/order/queries/useCreateOrder';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';
import { getApiErrorMessage } from '@shared/lib/errors/apiErrorMessage';
import { useRouter } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

import { useCheckoutContext } from '../../context/CheckoutContext';
import { loadTossPayments } from '../../lib/tossPayments';
import {
  buildCheckoutOrderPayload,
  buildCheckoutShipping,
  getCheckoutOrderName,
  getCheckoutPaymentActionLabel,
  isCheckoutShippingReady,
  validateCheckoutBeforePay,
} from '../../payment';

import type { CheckoutOrderStatus, CheckoutPaymentMethod } from '../../payment';

type UseCheckoutPaymentOptions = {
  items?: UserCartItem[];
  isBuyNow?: boolean;
};

export function useCheckoutPayment(options?: UseCheckoutPaymentOptions) {
  const t = useTranslations('Checkout.payment');
  const tApiError = useTranslations('Common.apiErrors');
  const router = useRouter();
  const { userCartItems, isCartSyncPending } = useCartContext();
  const { formState, isFormValid, selectedAddressId } = useCheckoutContext();
  const { mutateAsync, isPending } = useCreateOrder();
  const cartUpsertMutationCount = useIsMutating({
    mutationKey: cartMutationKeys.addToCart(),
  });
  const [selectedMethod, setSelectedMethod] =
    useState<CheckoutPaymentMethod>('test');
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [isDemoProcessing, setIsDemoProcessing] = useState(false);
  const checkoutItems = options?.items ?? userCartItems;
  const isBuyNow = !!options?.isBuyNow;
  const isUsingSavedAddress = selectedAddressId !== null;
  const shipping = buildCheckoutShipping({
    name: formState.name,
    phoneNumber: formState.phone_number,
    address1: formState.address_1,
    address2: formState.address_2,
  });
  const orderName = getCheckoutOrderName(checkoutItems, (primaryName, count) =>
    t('orderName.multiple', { primaryName, count }),
  );
  const isShippingReady = isCheckoutShippingReady(
    isUsingSavedAddress,
    shipping,
  );
  const isCartReady = !!checkoutItems && checkoutItems.length > 0;
  const isCartMutating = cartUpsertMutationCount > 0 || isCartSyncPending;
  const isBusy =
    isPending || isRequestingPayment || isDemoProcessing || isCartMutating;
  const isActionDisabled = isBusy || !isCartReady;

  const getInvalidCheckoutMessage = () =>
    validateCheckoutBeforePay({
      isShippingReady,
      isUsingSavedAddress,
      isFormValid,
      isCartReady,
    }) ?? null;

  const getLocalizedInvalidCheckoutMessage = () => {
    const invalidCode = getInvalidCheckoutMessage();

    if (!invalidCode) {
      return null;
    }

    const validationMessageByCode = {
      SHIPPING_REQUIRED: t('validation.shippingRequired'),
      SHIPPING_INVALID: t('validation.shippingInvalid'),
      EMPTY_CART: t('validation.emptyCart'),
    } satisfies Record<NonNullable<typeof invalidCode>, string>;

    return validationMessageByCode[invalidCode];
  };

  /**
   * Toss 결제창에서 돌아온 뒤 checkout 흐름을 복구하기 위해 entry 정보를 남긴다.
   * buyNow 항목은 장바구니 서버 상태에 없을 수 있어 별도 sessionStorage에 임시 보관한다.
   */
  const persistCheckoutEntryForPaymentRecovery = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(
      CHECKOUT_ENTRY_STORAGE_KEY,
      isBuyNow ? 'buyNow' : 'cart',
    );
    if (isBuyNow) {
      window.sessionStorage.setItem(
        BUY_NOW_CHECKOUT_STORAGE_KEY,
        JSON.stringify(checkoutItems),
      );
    }
  };

  const buildOrderPayload = (status: CheckoutOrderStatus) =>
    buildCheckoutOrderPayload({
      checkoutItems,
      selectedAddressId,
      shipping,
      status,
      isBuyNow,
    });

  const handleTossPayment = async () => {
    const invalidCheckoutMessage = getLocalizedInvalidCheckoutMessage();
    if (invalidCheckoutMessage) {
      toast.error(invalidCheckoutMessage);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      toast.error('Toss client key is missing.');
      return;
    }

    try {
      setIsRequestingPayment(true);
      // 외부 결제 승인 전에는 주문을 PENDING으로 만들고, 성공 callback에서 최종 승인한다.
      const order = await mutateAsync(buildOrderPayload('PENDING'));

      if (!order?.orderNumber) {
        throw new Error(t('errors.createOrderFailed'));
      }

      const TossPaymentsSDK = await loadTossPayments(
        t('errors.tossSdkLoadFailed'),
      );
      const tossPayments = TossPaymentsSDK(clientKey);

      persistCheckoutEntryForPaymentRecovery();

      await tossPayments.requestPayment('카드', {
        amount: order.totalAmount,
        orderId: order.orderNumber,
        orderName,
        customerName: shipping.recipientName,
        successUrl: `${window.location.origin}/payments/toss/success`,
        failUrl: `${window.location.origin}/payments/toss/fail`,
      });
    } catch (event) {
      setIsRequestingPayment(false);
      const errorMessage = getApiErrorMessage(
        event,
        tApiError,
        t('errors.paymentRequestFailed'),
      );
      toast.error(errorMessage);
    }
  };

  const handleDemoPayment = async () => {
    const invalidCheckoutMessage = getLocalizedInvalidCheckoutMessage();
    if (invalidCheckoutMessage) {
      toast.error(invalidCheckoutMessage);
      return;
    }

    try {
      setIsDemoProcessing(true);
      // 데모 결제는 외부 승인 단계가 없으므로 주문을 바로 확정 상태로 생성한다.
      await mutateAsync(buildOrderPayload('CONFIRMED'));
      window.sessionStorage.removeItem(CHECKOUT_ENTRY_STORAGE_KEY);
      window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY);
      toast.success(t('toast.demoCompleted'));
      router.replace('/my/orders');
    } catch (event) {
      const errorMessage = getApiErrorMessage(
        event,
        tApiError,
        t('errors.demoOrderFailed'),
      );
      toast.error(errorMessage);
    } finally {
      setIsDemoProcessing(false);
    }
  };

  const handlePay = async () => {
    if (selectedMethod === 'test') {
      await handleTossPayment();
      return;
    }

    await handleDemoPayment();
  };

  const actionLabel = getCheckoutPaymentActionLabel({
    isCartMutating,
    selectedMethod,
    isRequestingPayment,
    isDemoProcessing,
    labels: {
      cartSyncing: t('actions.cartSyncing'),
      requestingPayment: t('actions.requestingPayment'),
      testPayment: t('methods.test.title'),
      processing: t('actions.processing'),
      demoPayment: t('methods.demo.title'),
    },
  });

  return {
    actionLabel,
    handlePay,
    isActionDisabled,
    isBusy,
    isCartSyncPending,
    selectedMethod,
    setSelectedMethod,
  };
}
