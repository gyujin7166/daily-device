type CartVariant = {
  productId: number;
  productColorId?: number | null;
  colorName?: string | null;
};

function normalizeColorName(colorName?: string | null) {
  return (colorName ?? '').trim().toLowerCase();
}

/**
 * 장바구니 항목은 상품 ID만으로 구분할 수 없다.
 * DB colorId가 없는 로컬 장바구니 병합을 위해 colorId, colorName, 색상 없음 순서로 안정적인 키를 만든다.
 */
export function getCartVariantKey(variant: CartVariant) {
  const colorId = variant.productColorId;
  if (typeof colorId === 'number') {
    return `${variant.productId}:id:${colorId}`;
  }

  const normalizedColorName = normalizeColorName(variant.colorName);
  if (normalizedColorName) {
    return `${variant.productId}:name:${normalizedColorName}`;
  }

  return `${variant.productId}:none`;
}

export function isSameCartVariant(a: CartVariant, b: CartVariant) {
  return getCartVariantKey(a) === getCartVariantKey(b);
}
