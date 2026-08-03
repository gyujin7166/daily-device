import type { MouseEvent } from 'react';

import { useSearchParams } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import useCartActions from '@entities/cart/model/hooks/useCartActions';
import { useCartDrawerStore } from '@entities/cart/model/store/cartDrawerStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import {
  buildWishlistItem,
  getWishlistLoginPath,
} from '@entities/wishlist/lib/wishlist';
import { useDeleteWishlist } from '@entities/wishlist/queries/useDeleteWishlist';
import { useUpsertWishlist } from '@entities/wishlist/queries/useUpsertWishlist';
import { useWishlist } from '@entities/wishlist/queries/useWishlist';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { usePathname, useRouter } from '@shared/lib/i18n/navigation';
import { createCurrentPath } from '@shared/lib/router/currentPath';

import type {
  ProductItemProduct,
  ProductItemSelectedColor,
} from '../productItem';

type UseProductItemActionsParams = {
  product: ProductItemProduct;
  hasColors: boolean;
  selectedColor: ProductItemSelectedColor | null;
  fallbackColor?: ProductItemSelectedColor;
};

export const useProductItemActions = ({
  product,
  hasColors,
  selectedColor,
  fallbackColor,
}: UseProductItemActionsParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { openCart } = useCartDrawerStore((state) => state.actions);
  const { handleUpsertCartItem } = useCartActions();
  const { data: wishlistItems = [] } = useWishlist();
  const { mutate: addWishlist } = useUpsertWishlist();
  const { mutate: removeWishlist } = useDeleteWishlist();

  const currentPath = createCurrentPath(pathname, searchParams, '/products');
  const wishlistItem = buildWishlistItem(product);
  const isInWishlist =
    !!wishlistItem && wishlistItems.some((item) => item.id === wishlistItem.id);
  const resolvedColor = selectedColor ?? fallbackColor;
  const cartVariantKey =
    typeof product.id === 'number'
      ? getCartVariantKey({
          productId: product.id,
          productColorId: hasColors ? resolvedColor?.id : undefined,
          colorName: hasColors ? resolvedColor?.name : undefined,
        })
      : null;
  const isCartVariantMutationPending = useCartPendingStore((state) =>
    cartVariantKey
      ? Boolean(
          state.pendingAddingItemKeys[cartVariantKey] ||
          state.pendingCartSyncKeys[cartVariantKey],
        )
      : false,
  );
  const canAddToCart =
    status !== 'loading' &&
    typeof product.id === 'number' &&
    !isCartVariantMutationPending;

  const handleToggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!wishlistItem) {
      return;
    }

    if (!session?.user) {
      router.push(getWishlistLoginPath(currentPath));
      return;
    }

    if (isInWishlist) {
      removeWishlist(wishlistItem.id);
      return;
    }

    addWishlist(wishlistItem);
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (status === 'loading' || !canAddToCart || !product.id) {
      return;
    }

    handleUpsertCartItem({
      productId: product.id,
      quantity: 1,
      productColorId: hasColors ? resolvedColor?.id : undefined,
      colorName: hasColors ? resolvedColor?.name : undefined,
      product: {
        id: product.id,
        name_en: product.name_en ?? product.name_ko ?? product.name ?? '',
        slug: product.slug ?? undefined,
        price: Number(product.price ?? 0),
        originalPrice:
          product.originalPrice == null
            ? undefined
            : Number(product.originalPrice),
        discountedPrice:
          product.discountedPrice == null
            ? undefined
            : Number(product.discountedPrice),
        discountRate: product.discountRate ?? undefined,
        isDiscounted: product.isDiscounted ?? undefined,
        priceLabel: product.priceLabel ?? undefined,
        originalPriceLabel: product.originalPriceLabel ?? undefined,
        discountedPriceLabel: product.discountedPriceLabel ?? undefined,
        image_url:
          getProductThumbnailUrlBySelectedColor(
            product.ProductImage,
            hasColors ? resolvedColor?.id : undefined,
          ) ??
          product.image_url ??
          IMAGE_FALLBACK_URL,
        category: product.category?.name_en
          ? {
              name_en: product.category.name_en,
              slug: product.category.slug ?? undefined,
            }
          : undefined,
      },
      skipIfPending: true,
    });

    openCart();
  };

  return {
    wishlistItem,
    isInWishlist,
    canAddToCart,
    handleToggleWishlist,
    handleAddToCart,
  };
};
