import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import useProductDetailState from '../../model/hooks/useProductDetailState';
import ProductDetailAccordionSection from '../accordion/ProductDetailAccordionSection';

import ProductDetailHeader from './ProductDetailHeader';
import ProductDetailPurchaseSection from './ProductDetailPurchaseSection';
import ProductDetailRatingSection from './ProductDetailRatingSection';
import ProductDetailRatingSummarySuspense from './ProductDetailRatingSummarySuspense';
import ProductDetailSkeleton from './ProductDetailSkeleton';

type ProductDetailProps = {
  detail: string;
  onSelectedColorChange?: (colorId: number | null) => void;
};

export default function ProductDetail({
  detail,
  onSelectedColorChange,
}: ProductDetailProps) {
  const {
    contentHeights,
    contentRefs,
    displayPrice,
    handleAddToCart,
    handleBuyNow,
    handleColorChange,
    decreaseQuantity,
    handleToggleDescription,
    handleWishlistToggle,
    increaseQuantity,
    isAddToCartDisabled,
    isInWishlist,
    isPending,
    product,
    productDetails,
    quantity,
    sectionIds,
    toggleState,
    updateContentHeight,
    wishlistItem,
  } = useProductDetailState({ detail, onSelectedColorChange });

  if (isPending || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="text-ink dark:text-surface">
      <ProductDetailHeader
        productLine={product.productLine}
        name={product.name_en}
        isInWishlist={isInWishlist}
        isWishlistDisabled={!wishlistItem}
        onWishlistToggle={handleWishlistToggle}
      />

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallback={({ reset: resetErrorBoundary }) => (
              <QueryErrorFallback
                title="평점 정보를 불러오지 못했습니다."
                onRetry={resetErrorBoundary}
                className="mt-5 px-4 py-5"
              />
            )}
          >
            <Suspense
              fallback={
                <ProductDetailRatingSection
                  reviewCount={0}
                  averageRating={0}
                  isReviewSummaryLoading
                />
              }
            >
              <ProductDetailRatingSummarySuspense detail={detail} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>

      <ProductDetailPurchaseSection
        displayPrice={displayPrice}
        originalPriceLabel={product.originalPriceLabel}
        discountedPriceLabel={product.discountedPriceLabel}
        discountRate={product.discountRate}
        isDiscounted={product.isDiscounted}
        description={product.description}
        colors={product.productColor}
        quantity={quantity}
        onDecreaseQuantity={decreaseQuantity}
        onIncreaseQuantity={increaseQuantity}
        onColorChange={handleColorChange}
        onAddToCart={handleAddToCart}
        isAddToCartDisabled={isAddToCartDisabled}
        onBuyNow={handleBuyNow}
      />

      {product.detailed_description ? (
        <p className="mt-6 text-sm leading-[1.6] text-muted dark:text-dark-muted">
          {product.detailed_description}
        </p>
      ) : null}

      <ProductDetailAccordionSection
        sectionIds={sectionIds}
        toggleState={toggleState}
        onToggleDescription={handleToggleDescription}
        productDetails={productDetails}
        contentHeights={contentHeights}
        contentRefs={contentRefs}
        onUpdateContentHeight={updateContentHeight}
      />
    </div>
  );
}
