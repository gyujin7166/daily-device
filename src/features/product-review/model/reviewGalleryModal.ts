import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import type { ReviewGalleryDetailViewProps } from './reviewGalleryDetail';

export type ReviewGalleryModalProps = {
  currentPath: string;
  isOpen: boolean;
  images: ProductReviewGalleryImage[];
  totalCount: number;
  hasMore: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onClose: () => void;
  initialIndex?: number;
  initialView?: 'grid' | 'detail';
  detailEntrySource?: 'gallery' | 'review-card';
};

const formatReviewGalleryDate = (createdAt?: string) => {
  if (!createdAt) {
    return '-';
  }

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getReviewGalleryDetailImages = ({
  selectedImage,
  images,
}: {
  selectedImage?: ProductReviewGalleryImage;
  images: ProductReviewGalleryImage[];
}) => {
  const selectedReview = selectedImage?.productReview;

  if (selectedReview?.reviewImages?.length) {
    return [...selectedReview.reviewImages].sort(
      (a, b) => a.order - b.order || a.id - b.id,
    );
  }

  if (!selectedImage) {
    return [];
  }

  // 갤러리 API 응답에 reviewImages가 없는 경우에도 같은 리뷰의 이미지들을 모아 detail view를 구성한다.
  return images
    .filter((image) => image.productReviewId === selectedImage.productReviewId)
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      blur_data_url: image.blur_data_url,
      order: image.order,
    }))
    .sort((a, b) => a.order - b.order || a.id - b.id);
};

type GetReviewGallerySelectedDetailParams = {
  selectedImage?: ProductReviewGalleryImage;
  images: ProductReviewGalleryImage[];
  detailSelectedImageId: number | null;
};

export const getReviewGallerySelectedDetail = ({
  selectedImage,
  images,
  detailSelectedImageId,
}: GetReviewGallerySelectedDetailParams) => {
  const selectedReview = selectedImage?.productReview;
  const detailImages = getReviewGalleryDetailImages({
    selectedImage,
    images,
  });
  const detailImageIndex = detailImages.length
    ? detailImages.findIndex((image) => image.id === detailSelectedImageId)
    : -1;
  const detailImage =
    detailImageIndex >= 0 ? detailImages[detailImageIndex] : detailImages[0];
  const selectedRating = Math.max(0, Math.min(5, selectedReview?.rating ?? 0));
  const helpfulCount = Math.max(0, selectedReview?.helpfulCount ?? 0);
  const selectedReviewId = selectedReview?.id ?? null;
  const isHelpfulActive = selectedReview?.currentUserVote === true;
  const reviewContentText = selectedReview?.content ?? '리뷰 내용이 없습니다.';
  const shouldShowContentToggle = reviewContentText.length > 140;

  return {
    detailImage,
    detailImageIndex,
    detailImages,
    helpfulCount,
    isHelpfulActive,
    reviewContentText,
    selectedRating,
    selectedReview,
    selectedReviewId,
    shouldShowContentToggle,
  };
};

type BuildReviewGalleryDetailViewPropsParams = Omit<
  ReviewGalleryDetailViewProps,
  'formatReviewDate'
> & {
  formatReviewDate?: ReviewGalleryDetailViewProps['formatReviewDate'];
};

export const buildReviewGalleryDetailViewProps = ({
  formatReviewDate = formatReviewGalleryDate,
  ...props
}: BuildReviewGalleryDetailViewPropsParams): ReviewGalleryDetailViewProps => ({
  ...props,
  formatReviewDate,
});
