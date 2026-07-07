import { useCallback, useEffect, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartContext } from '@entities/cart/model/context/CartContext';
import useCartActions from '@entities/cart/model/hooks/useCartActions';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import { useProductDescription } from '@entities/product/queries/useProductDescription';
import { useProductImages } from '@entities/product/queries/useProductImages';
import {
  buildWishlistItem,
  getWishlistLoginPath,
} from '@entities/wishlist/lib/wishlist';
import { useDeleteWishlist } from '@entities/wishlist/queries/useDeleteWishlist';
import { useUpsertWishlist } from '@entities/wishlist/queries/useUpsertWishlist';
import { useWishlist } from '@entities/wishlist/queries/useWishlist';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';
import { createCurrentPath } from '@shared/lib/router/currentPath';

import {
  buildBuyNowItem,
  formatProductDetailPrice,
  getProductDetailSectionIds,
} from '../productDetail';

import type { SelectedProductColor } from '../productDetail';

type UseProductDetailStateParams = {
  detail: string;
  onSelectedColorChange?: (colorId: number | null) => void;
};

export default function useProductDetailState({
  detail,
  onSelectedColorChange,
}: UseProductDetailStateParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openCart, isCartVariantMutationPending } = useCartContext();
  const { handleUpsertCartItem } = useCartActions();
  const { data: wishlistItems = [] } = useWishlist();
  const { mutate: addWishlist } = useUpsertWishlist();
  const { mutate: removeWishlist } = useDeleteWishlist();
  const { data, isPending } = useProductDescription(detail);
  const { data: productImages } = useProductImages(detail);
  const { data: session } = useSession();

  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [contentHeights, setContentHeights] = useState<Record<string, number>>(
    {},
  );
  const [selectedColor, setSelectedColor] = useState<
    SelectedProductColor | undefined
  >(undefined);
  const [quantity, setQuantity] = useState(1);
  const productDetails = data?.productDetails ?? [];
  const product = data?.product;
  const mainImageUrl =
    getProductThumbnailUrlBySelectedColor(productImages, selectedColor?.id) ??
    productImages?.[0]?.image_url;
  const currentPath = createCurrentPath(pathname, searchParams, '/products');
  const sectionIds = getProductDetailSectionIds(productDetails);
  const displayPrice =
    product?.priceLabel ?? formatProductDetailPrice(product?.price);
  const cartVariantKey = product
    ? getCartVariantKey({
        productId: product.id,
        productColorId: selectedColor?.id,
        colorName: selectedColor?.name,
      })
    : null;
  const isAddToCartDisabled =
    !!cartVariantKey && isCartVariantMutationPending(cartVariantKey);

  const wishlistItem =
    product?.id && mainImageUrl
      ? buildWishlistItem({
          id: product.id,
          name_en: product.name_en,
          slug: product.slug,
          productLine: product.productLine,
          description: product.description,
          price: product.price,
          priceLabel: product.priceLabel,
          originalPrice: product.originalPrice,
          originalPriceLabel: product.originalPriceLabel,
          discountedPrice: product.discountedPrice,
          discountedPriceLabel: product.discountedPriceLabel,
          discountRate: product.discountRate,
          isDiscounted: product.isDiscounted,
          category: product.category,
          productColor: product.productColor,
          image_url: mainImageUrl,
          href: currentPath,
          alt: product.name_en,
        })
      : null;

  const isInWishlist = wishlistItem
    ? wishlistItems.some((item) => item.id === wishlistItem.id)
    : false;

  const handleColorChange = useCallback(
    (color: { id: number; name: string }) => {
      setSelectedColor({
        id: color.id,
        name: color.name,
      });
      onSelectedColorChange?.(color.id);
    },
    [onSelectedColorChange],
  );

  const handleWishlistToggle = () => {
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

  const updateContentHeight = useCallback(
    (sectionKey: string, node?: HTMLDivElement | null) => {
      const targetNode = node ?? contentRefs.current[sectionKey];
      if (!targetNode) {
        return;
      }

      const nextHeight = Math.ceil(targetNode.scrollHeight);
      setContentHeights((prev) =>
        prev[sectionKey] === nextHeight
          ? prev
          : {
              ...prev,
              [sectionKey]: nextHeight,
            },
      );
    },
    [],
  );

  const handleToggleDescription = (titleId: number) => {
    const sectionKey = `${titleId}`;
    setToggleState((prevToggleState) => ({
      ...prevToggleState,
      [sectionKey]: !prevToggleState[sectionKey],
    }));
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => Math.min(prevQuantity + 1, 10));
  };

  const handleAddToCart = () => {
    if (!product || isAddToCartDisabled) {
      return;
    }

    handleUpsertCartItem({
      productId: product.id,
      quantity,
      productColorId: selectedColor?.id,
      colorName: selectedColor?.name,
      product: {
        id: product.id,
        name_en: product.name_en,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice,
        discountRate: product.discountRate,
        isDiscounted: product.isDiscounted,
        priceLabel: product.priceLabel,
        originalPriceLabel: product.originalPriceLabel,
        discountedPriceLabel: product.discountedPriceLabel,
        image_url: mainImageUrl ?? '',
        category: product.category?.name_en
          ? {
              name_en: product.category.name_en,
              slug: product.category.slug,
            }
          : undefined,
      },
      skipIfPending: true,
    });
    openCart();
  };

  const handleBuyNow = () => {
    const buyNowItem = buildBuyNowItem({
      product,
      mainImageUrl,
      selectedColor,
      quantity,
    });

    if (!buyNowItem) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        BUY_NOW_CHECKOUT_STORAGE_KEY,
        JSON.stringify([buyNowItem]),
      );
      window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'buyNow');
    }

    router.push('/checkout');
  };

  useEffect(() => {
    if (!product?.productColor?.length) {
      setSelectedColor(undefined);
      onSelectedColorChange?.(null);
      return;
    }

    const defaultColor =
      product.productColor.find((item) => item.isDefault) ??
      product.productColor[0];
    setSelectedColor({
      id: defaultColor.id,
      name: defaultColor.color.name,
    });
    onSelectedColorChange?.(defaultColor.id);
  }, [onSelectedColorChange, product?.productColor]);

  useEffect(() => {
    setToggleState({});
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      Object.keys(contentRefs.current).forEach((sectionKey) => {
        updateContentHeight(sectionKey);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateContentHeight]);

  return {
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
  };
}
