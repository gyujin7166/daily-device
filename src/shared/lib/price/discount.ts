export type ProductPriceInfo = {
  price: number;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  isDiscounted: boolean;
  priceLabel: string;
  originalPriceLabel: string;
  discountedPriceLabel: string;
};

const formatWon = (price: number) => `${price.toLocaleString('ko-KR')}원`;

const normalizeDiscountRate = (discountRate?: number | null) => {
  if (typeof discountRate !== 'number' || !Number.isFinite(discountRate)) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(discountRate), 0), 100);
};

const calculateDiscountedPrice = (
  price: number,
  discountRate?: number | null,
) => {
  const safePrice = Number.isFinite(price) ? Math.max(price, 0) : 0;
  const safeDiscountRate = normalizeDiscountRate(discountRate);

  if (safeDiscountRate <= 0) {
    return safePrice;
  }

  return Math.floor((safePrice * (100 - safeDiscountRate)) / 100);
};

export const getProductPriceInfo = (
  price: number,
  discountRate?: number | null,
): ProductPriceInfo => {
  const originalPrice = Number.isFinite(price) ? Math.max(price, 0) : 0;
  const normalizedDiscountRate = normalizeDiscountRate(discountRate);
  const discountedPrice = calculateDiscountedPrice(
    originalPrice,
    normalizedDiscountRate,
  );
  const isDiscounted =
    normalizedDiscountRate > 0 && discountedPrice < originalPrice;

  return {
    price: discountedPrice,
    originalPrice,
    discountedPrice,
    discountRate: normalizedDiscountRate,
    isDiscounted,
    priceLabel: formatWon(discountedPrice),
    originalPriceLabel: formatWon(originalPrice),
    discountedPriceLabel: formatWon(discountedPrice),
  };
};
