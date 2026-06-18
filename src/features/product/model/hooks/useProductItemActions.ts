import type { MouseEvent } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartContext } from '@entities/cart/model/context/CartContext';
import useCartActions from '@entities/cart/model/hooks/useCartActions';
import {
  buildWishlistItem,
  getWishlistLoginPath,
} from '@entities/wishlist/lib/wishlist';
import { useDeleteWishlist } from '@entities/wishlist/queries/useDeleteWishlist';
import { useUpsertWishlist } from '@entities/wishlist/queries/useUpsertWishlist';
import { useWishlist } from '@entities/wishlist/queries/useWishlist';

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
  const { data: session } = useSession();
  const { openCart, isCartVariantMutationPending } = useCartContext();
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
  const canAddToCart =
    typeof product.id === 'number' &&
    (!cartVariantKey || !isCartVariantMutationPending(cartVariantKey));

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

    if (!canAddToCart || !product.id) {
      return;
    }

    handleUpsertCartItem({
      productId: product.id,
      quantity: 1,
      productColorId: hasColors ? resolvedColor?.id : undefined,
      colorName: hasColors ? resolvedColor?.name : undefined,
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
