import type { ProductReviewGalleryImage } from '@entities/review/model/types';

export type ReviewGalleryDetailImageItem = {
  id: number;
  image_url: string;
  blur_data_url: string | null;
  order: number;
};

export type ReviewGallerySelectedReview = NonNullable<
  ProductReviewGalleryImage['productReview']
>;

export type ReviewGalleryDetailViewProps = {
  detailImage: ReviewGalleryDetailImageItem;
  detailImageIndex: number;
  detailImages: ReviewGalleryDetailImageItem[];
  selectedReview: ReviewGallerySelectedReview;
  selectedReviewId: number | null;
  selectedRating: number;
  helpfulCount: number;
  isHelpfulActive: boolean;
  isFeedbackPendingForSelected: boolean;
  canNavigateReview: boolean;
  canReturnToGallery: boolean;
  reviewTransitionDirection: 'prev' | 'next' | null;
  reviewContentText: string;
  shouldShowContentToggle: boolean;
  isReviewContentExpanded: boolean;
  onToggleReviewContent: () => void;
  onFeedbackClick: () => void;
  onCloseDetail: () => void;
  onCloseModal: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectDetailImage: (imageId: number) => void;
  formatReviewDate: (createdAt?: string) => string;
};
