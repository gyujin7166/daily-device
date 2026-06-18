import type { UserCartItem } from '@entities/cart/model/types';

const isObject = (value: unknown): value is Partial<UserCartItem> =>
  typeof value === 'object' && value !== null;

const isUserCartItem = (value: unknown): value is UserCartItem => {
  if (!isObject(value)) {
    return false;
  }

  const { productId, quantity, product } = value;

  return (
    typeof productId === 'number' &&
    typeof quantity === 'number' &&
    quantity > 0 &&
    isObject(product) &&
    typeof product.id === 'number' &&
    typeof product.name_en === 'string' &&
    typeof product.slug === 'string' &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price)
  );
};

/**
 * buyNow 항목은 sessionStorage를 거쳐 복원되므로 신뢰할 수 없는 JSON으로 취급한다.
 * 결제 화면이 렌더링에 필요한 최소 필드만 통과시키고, 깨진 항목은 버린다.
 */
export const parseBuyNowCartItems = (
  rawItems: string | null,
): UserCartItem[] => {
  if (!rawItems) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawItems);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isUserCartItem);
  } catch {
    return [];
  }
};
