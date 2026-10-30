type EcommerceEventName = 'view_item' | 'add_to_cart' | 'begin_checkout';

type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

type EcommerceItemInput = {
  productId: number;
  product: {
    name_en: string;
    price: number;
    category?: { name_en: string } | null;
  };
  colorName?: string | null;
  quantity: number;
};

type PurchaseEventInput = {
  transactionId: string;
  value: number;
  items: Array<{
    productId: number;
    productName: string;
    colorName?: string | null;
    price: number;
    quantity: number;
  }>;
};

// Storage can be unavailable in restricted browser contexts.
const purchasesWithoutStorage = new Set<string>();

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      event: EcommerceEventName | 'purchase',
      parameters: {
        currency: 'KRW';
        value: number;
        items: EcommerceItem[];
        transaction_id?: string;
      },
    ) => void;
  }
}

export function toEcommerceItem({
  productId,
  product,
  colorName,
  quantity,
}: EcommerceItemInput): EcommerceItem {
  return {
    item_id: String(productId),
    item_name: product.name_en,
    ...(product.category?.name_en
      ? { item_category: product.category.name_en }
      : {}),
    ...(colorName ? { item_variant: colorName } : {}),
    price: product.price,
    quantity,
  };
}

export function trackEcommerceEvent(
  event: EcommerceEventName,
  items: EcommerceItem[],
): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function' ||
    items.length === 0
  ) {
    return false;
  }

  window.gtag('event', event, {
    currency: 'KRW',
    value: items.reduce((total, item) => total + item.price * item.quantity, 0),
    items,
  });
  return true;
}

export function trackPurchaseEvent({
  transactionId,
  value,
  items,
}: PurchaseEventInput): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (
      typeof window.gtag !== 'function' ||
      !transactionId?.trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      purchasesWithoutStorage.has(transactionId)
    )
      return false;

    const marker = `ga4:purchase:${transactionId}`;
    try {
      if (window.sessionStorage.getItem(marker)) return false;
    } catch {
      /* Analytics must not block payment when storage is restricted. */
    }

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'KRW',
      value,
      items: items.map((item) =>
        toEcommerceItem({
          productId: item.productId,
          product: { name_en: item.productName, price: item.price },
          colorName: item.colorName,
          quantity: item.quantity,
        }),
      ),
    });

    try {
      window.sessionStorage.setItem(marker, '1');
    } catch {
      purchasesWithoutStorage.add(transactionId);
    }
    return true;
  } catch {
    return false;
  }
}
