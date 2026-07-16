import type { UserCartItem } from '@entities/cart/model/types';
import type { CreateOrderRequest } from '@entities/order/model/types';

export type CheckoutPaymentMethod = 'test' | 'demo';
export type CheckoutOrderStatus = 'PENDING' | 'CONFIRMED';

type CheckoutShippingPayload = {
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2?: string;
};

type BuildCheckoutShippingParams = {
  name?: string;
  phoneNumber?: string;
  address1?: string;
  address2?: string;
};

type ValidateCheckoutBeforePayParams = {
  isShippingReady: boolean;
  isUsingSavedAddress: boolean;
  isFormValid: boolean;
  isCartReady: boolean;
};

export type CheckoutValidationErrorCode =
  | 'SHIPPING_REQUIRED'
  | 'SHIPPING_INVALID'
  | 'EMPTY_CART';

type BuildCheckoutOrderPayloadParams = {
  checkoutItems: UserCartItem[];
  selectedAddressId: number | null;
  shipping: CheckoutShippingPayload;
  status: CheckoutOrderStatus;
  isBuyNow: boolean;
};

type GetCheckoutPaymentActionLabelParams = {
  isCartMutating: boolean;
  selectedMethod: CheckoutPaymentMethod;
  isRequestingPayment: boolean;
  isDemoProcessing: boolean;
  labels?: {
    cartSyncing: string;
    requestingPayment: string;
    testPayment: string;
    processing: string;
    demoPayment: string;
  };
};

export const buildCheckoutShipping = ({
  name,
  phoneNumber,
  address1,
  address2,
}: BuildCheckoutShippingParams): CheckoutShippingPayload => ({
  recipientName: name?.trim() ?? '',
  recipientPhone: phoneNumber?.trim() ?? '',
  address1: address1?.trim() ?? '',
  address2: address2?.trim() || undefined,
});

export const getCheckoutOrderName = (
  checkoutItems: UserCartItem[],
  formatMultipleItems?: (primaryName: string, extraCount: number) => string,
) => {
  const totalCheckoutItemCount = checkoutItems.length;
  const primaryCheckoutItemName = checkoutItems[0]?.product?.name_en || 'Order';

  return totalCheckoutItemCount === 1
    ? primaryCheckoutItemName
    : (formatMultipleItems?.(
        primaryCheckoutItemName,
        totalCheckoutItemCount - 1,
      ) ?? `${primaryCheckoutItemName} + ${totalCheckoutItemCount - 1}`);
};

export const isCheckoutShippingReady = (
  isUsingSavedAddress: boolean,
  shipping: CheckoutShippingPayload,
) =>
  isUsingSavedAddress ||
  (!!shipping.recipientName &&
    !!shipping.recipientPhone &&
    !!shipping.address1);

/**
 * 저장 배송지를 선택한 경우 서버에 userAddressId만 넘기기 위해 입력 폼 validation을 결제 조건에서 제외한다.
 * 새 배송지를 입력하는 흐름에서만 필드별 validation 실패를 결제 차단 사유로 사용한다.
 */
export const validateCheckoutBeforePay = ({
  isShippingReady,
  isUsingSavedAddress,
  isFormValid,
  isCartReady,
}: ValidateCheckoutBeforePayParams): CheckoutValidationErrorCode | null => {
  if (!isShippingReady) {
    return 'SHIPPING_REQUIRED';
  }

  if (!isUsingSavedAddress && !isFormValid) {
    return 'SHIPPING_INVALID';
  }

  if (!isCartReady) {
    return 'EMPTY_CART';
  }

  return null;
};

/**
 * 주문 API는 저장 배송지와 일회성 배송지를 상호 배타적인 payload로 받는다.
 * 저장 배송지 선택 시 shipping 객체를 함께 보내지 않아 서버의 주소 스냅샷 생성 규칙을 단순하게 유지한다.
 */
export const buildCheckoutOrderPayload = ({
  checkoutItems,
  selectedAddressId,
  shipping,
  status,
  isBuyNow,
}: BuildCheckoutOrderPayloadParams): CreateOrderRequest => {
  const items = checkoutItems.map((item) => ({
    productId: item.productId,
    productColorId: item.productColorId ?? undefined,
    quantity: item.quantity,
  }));

  if (selectedAddressId !== null) {
    return {
      items,
      userAddressId: selectedAddressId,
      status,
      isBuyNow,
    };
  }

  return {
    items,
    shipping,
    status,
    isBuyNow,
  };
};

export const getCheckoutPaymentActionLabel = ({
  isCartMutating,
  selectedMethod,
  isRequestingPayment,
  isDemoProcessing,
  labels,
}: GetCheckoutPaymentActionLabelParams) => {
  const resolvedLabels = labels ?? {
    cartSyncing: 'Syncing cart...',
    requestingPayment: 'Requesting payment...',
    testPayment: 'Test payment',
    processing: 'Processing...',
    demoPayment: 'Demo payment',
  };

  if (isCartMutating) {
    return resolvedLabels.cartSyncing;
  }

  if (selectedMethod === 'test') {
    return isRequestingPayment
      ? resolvedLabels.requestingPayment
      : resolvedLabels.testPayment;
  }

  return isDemoProcessing
    ? resolvedLabels.processing
    : resolvedLabels.demoPayment;
};
