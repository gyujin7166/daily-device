type ProductItemPriceProps = {
  price: string | null;
  originalPrice: string | null;
  discountedPrice: string | null;
  discountRate: number;
  isDiscounted: boolean;
  className?: string;
};

export default function ProductItemPrice({
  price,
  originalPrice,
  discountedPrice,
  discountRate,
  isDiscounted,
  className = '',
}: ProductItemPriceProps) {
  if (!price) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex min-h-3 items-center gap-2 text-xs font-semibold leading-none">
        {isDiscounted && originalPrice && discountedPrice ? (
          <>
            <span className="text-danger">{discountRate}%</span>
            <span className="text-muted line-through dark:text-dark-muted">
              {originalPrice}
            </span>
          </>
        ) : null}
      </div>
      <p className={className}>
        {isDiscounted && discountedPrice ? discountedPrice : price}
      </p>
    </div>
  );
}
