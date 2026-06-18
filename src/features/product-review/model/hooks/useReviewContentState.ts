import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';
import { useProductReviewGalleryImages } from '@entities/review/queries/useProductReviewGalleryImages';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { toast } from '@shared/lib/toast';

import { useUpsertProductReviewFeedback } from '../../queries/useUpsertProductReviewFeedback';
import { getReviewShowingRange } from '../reviewContent';

import type {
  ReviewContentCardImage,
  ReviewContentProps,
} from '../reviewContent';

export const useReviewContentState = ({
  detail,
  currentPath,
  productReview,
  currentPage = 1,
  isRefreshing = false,
  isLoading = false,
}: ReviewContentProps) => {
  const router = useRouter();
  const { status } = useSession();
  const {
    mutate: upsertProductReviewFeedback,
    isPending: isProductReviewFeedbackPending,
    variables: productReviewFeedbackVariables,
  } = useUpsertProductReviewFeedback();
  const {
    data: reviewGalleryImages = [],
    total: reviewGalleryTotal = 0,
    hasNextPage: hasNextGalleryPage,
    isPending: isGalleryPending,
    isFetchingNextPage: isFetchingNextGalleryPage,
    fetchNextPage: fetchNextGalleryPage,
  } = useProductReviewGalleryImages(detail);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [galleryInitialView, setGalleryInitialView] = useState<
    'grid' | 'detail'
  >('grid');
  const [galleryDetailEntrySource, setGalleryDetailEntrySource] = useState<
    'gallery' | 'review-card'
  >('gallery');
  const reviewItems = useMemo(
    () => productReview?.items ?? [],
    [productReview?.items],
  );
  const localReviewGalleryImages = useMemo<ProductReviewGalleryImage[]>(
    () =>
      reviewItems.flatMap((review) =>
        review.ProductReviewImage.map((image) => ({
          id: image.id,
          productReviewId: review.id,
          image_url: image.image_url,
          blur_data_url: image.blur_data_url,
          order: image.order,
          productReview: {
            id: review.id,
            rating: review.rating,
            title: review.title,
            content: review.content,
            createdAt: review.createdAt,
            helpfulCount: review.helpfulCount,
            currentUserVote: review.currentUserVote,
            reviewImages: review.ProductReviewImage.map((reviewImage) => ({
              id: reviewImage.id,
              image_url: reviewImage.image_url,
              blur_data_url: reviewImage.blur_data_url,
              order: reviewImage.order,
            })),
            orderItem: review.orderItem,
            user: review.user,
          },
        })),
      ),
    [reviewItems],
  );
  const mergedReviewGalleryImages = useMemo(() => {
    const seenIds = new Set<number>();
    const mergedImages: ProductReviewGalleryImage[] = [];

    [...reviewGalleryImages, ...localReviewGalleryImages].forEach((image) => {
      if (seenIds.has(image.id)) {
        return;
      }

      seenIds.add(image.id);
      mergedImages.push(image);
    });

    return mergedImages;
  }, [localReviewGalleryImages, reviewGalleryImages]);
  const reviewIndexById = new Map(
    reviewItems.map((review, index) => [review.id, index]),
  );
  const previewGalleryItems = reviewGalleryImages.slice(0, 8);
  const hasLocalGalleryItems = previewGalleryItems.length > 0;
  const summaryTotalReviewImageCount = Math.max(
    0,
    Math.floor(productReview?.totalReviewImageCount ?? 0),
  );
  const safeTotalReviewImageCount =
    reviewGalleryTotal > 0 ? reviewGalleryTotal : summaryTotalReviewImageCount;
  const hiddenGalleryCount = Math.max(
    0,
    safeTotalReviewImageCount - previewGalleryItems.length,
  );
  const shouldShowSkeleton = isLoading;
  const shouldShowGallerySkeleton =
    shouldShowSkeleton ||
    (reviewGalleryImages.length === 0 &&
      (isGalleryPending || isFetchingNextGalleryPage));
  const { safeTotalItems, showingStart, showingEnd } = getReviewShowingRange({
    currentPage: productReview?.currentPage ?? currentPage,
    perPage: productReview?.perPage ?? 12,
    totalItems: productReview?.totalItems ?? 0,
  });

  const openGalleryModal = (startIndex = 0) => {
    if (!mergedReviewGalleryImages.length) {
      return;
    }

    const safeIndex = Math.max(
      0,
      Math.min(startIndex, mergedReviewGalleryImages.length - 1),
    );
    setGalleryInitialIndex(safeIndex);
    setGalleryInitialView('grid');
    setGalleryDetailEntrySource('gallery');
    setIsGalleryModalOpen(true);
  };

  const openGalleryDetailModal = (
    startIndex = 0,
    detailEntrySource: 'gallery' | 'review-card' = 'gallery',
  ) => {
    if (!mergedReviewGalleryImages.length) {
      return;
    }

    const safeIndex = Math.max(
      0,
      Math.min(startIndex, mergedReviewGalleryImages.length - 1),
    );
    setGalleryInitialIndex(safeIndex);
    setGalleryInitialView('detail');
    setGalleryDetailEntrySource(detailEntrySource);
    setIsGalleryModalOpen(true);
  };

  const handleFeedbackClick = (productReviewId: number) => {
    if (isRefreshing || status === 'loading') {
      return;
    }

    if (status !== 'authenticated') {
      toast.info('리뷰 도움 표시 기능은 로그인 후 사용할 수 있습니다.');
      router.push(getLoginRedirectPath(currentPath));
      return;
    }

    upsertProductReviewFeedback({ productReviewId });
  };

  const handleOpenReviewImageDetail = (
    reviewImages: ReviewContentCardImage[],
    imageIndex: number,
  ) => {
    const selectedReviewImage = reviewImages[imageIndex];

    if (!selectedReviewImage) {
      return;
    }

    const galleryIndex = mergedReviewGalleryImages.findIndex(
      (image) => String(image.id) === String(selectedReviewImage.id),
    );

    if (galleryIndex < 0) {
      return;
    }

    openGalleryDetailModal(galleryIndex, 'review-card');
  };

  const getReviewImages = (reviewId: number) => {
    const originalReviewIdx = reviewIndexById.get(reviewId) ?? -1;
    return originalReviewIdx >= 0
      ? (reviewItems[originalReviewIdx]?.ProductReviewImage ?? [])
      : [];
  };

  const isFeedbackPendingForReview = (reviewId: number) =>
    isProductReviewFeedbackPending &&
    productReviewFeedbackVariables?.productReviewId === reviewId;

  const handleLoadMoreGallery = () => {
    if (hasNextGalleryPage && !isFetchingNextGalleryPage) {
      fetchNextGalleryPage();
    }
  };

  return {
    reviews: reviewItems,
    safeTotalItems,
    showingStart,
    showingEnd,
    previewGalleryItems,
    hasLocalGalleryItems,
    safeTotalReviewImageCount,
    hiddenGalleryCount,
    shouldShowSkeleton,
    shouldShowGallerySkeleton,
    reviewGalleryImages: mergedReviewGalleryImages,
    hasNextGalleryPage,
    isFetchingNextGalleryPage,
    galleryModalProps: {
      isOpen: isGalleryModalOpen,
      images: mergedReviewGalleryImages,
      totalCount: safeTotalReviewImageCount,
      hasMore: !!hasNextGalleryPage,
      isLoadingMore: isFetchingNextGalleryPage,
      initialIndex: galleryInitialIndex,
      initialView: galleryInitialView,
      detailEntrySource: galleryDetailEntrySource,
      onLoadMore: handleLoadMoreGallery,
      onClose: () => setIsGalleryModalOpen(false),
    },
    openGalleryModal,
    openGalleryDetailModal,
    getReviewImages,
    isFeedbackPendingForReview,
    handleFeedbackClick,
    handleOpenReviewImageDetail,
  };
};
