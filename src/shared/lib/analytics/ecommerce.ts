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

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      event: EcommerceEventName,
      parameters: { currency: 'KRW'; value: number; items: EcommerceItem[] },
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
