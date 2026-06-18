import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import { useScrollLock } from '@shared/hooks/useScrollLock';

import {
  buildReviewGalleryDetailViewProps,
  getReviewGallerySelectedDetail,
} from '../reviewGalleryModal';

import useReviewGalleryFeedback from './useReviewGalleryFeedback';

type UseReviewGalleryModalStateParams = {
  currentPath: string;
  isOpen: boolean;
  images: ProductReviewGalleryImage[];
  initialIndex: number;
  initialView: 'grid' | 'detail';
  detailEntrySource: 'gallery' | 'review-card';
  onClose: () => void;
};

export const useReviewGalleryModalState = ({
  currentPath,
  isOpen,
  images,
  initialIndex,
  initialView,
  detailEntrySource,
  onClose,
}: UseReviewGalleryModalStateParams) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewContentExpanded, setIsReviewContentExpanded] = useState(false);
  const [reviewTransitionDirection, setReviewTransitionDirection] = useState<
    'prev' | 'next' | null
  >(null);
  const [detailSelectedImageId, setDetailSelectedImageId] = useState<
    number | null
  >(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasInitializedOpenStateRef = useRef(false);
  useScrollLock(isOpen);

  const selectedImage = images[selectedIndex];
  const reviewStartIndexes = useMemo(() => {
    const seenReviewIds = new Set<number>();

    return images.reduce<number[]>((indexes, image, index) => {
      if (seenReviewIds.has(image.productReviewId)) {
        return indexes;
      }

      seenReviewIds.add(image.productReviewId);
      indexes.push(index);
      return indexes;
    }, []);
  }, [images]);
  const selectedReviewPosition = reviewStartIndexes.findIndex(
    (index) =>
      images[index]?.productReviewId === selectedImage?.productReviewId,
  );
  const canNavigateReview =
    detailEntrySource === 'gallery' && reviewStartIndexes.length > 1;
  const canReturnToGallery = detailEntrySource === 'gallery';
  const selectedDetail = useMemo(
    () =>
      getReviewGallerySelectedDetail({
        selectedImage,
        images,
        detailSelectedImageId,
      }),
    [detailSelectedImageId, images, selectedImage],
  );
  const {
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
  } = selectedDetail;
  const { handleSelectedFeedbackClick, isFeedbackPendingForSelected } =
    useReviewGalleryFeedback({
      currentPath,
      selectedReviewId,
    });

  const goToPrev = useCallback(() => {
    if (!canNavigateReview || selectedReviewPosition < 0) {
      return;
    }

    const prevReviewPosition =
      selectedReviewPosition === 0
        ? reviewStartIndexes.length - 1
        : selectedReviewPosition - 1;
    const prevIndex = reviewStartIndexes[prevReviewPosition];
    const prevImage = typeof prevIndex === 'number' ? images[prevIndex] : null;

    if (prevImage) {
      setReviewTransitionDirection('prev');
      setSelectedIndex(prevIndex);
      setDetailSelectedImageId(prevImage.id);
      setIsDetailOpen(true);
    }
  }, [canNavigateReview, images, reviewStartIndexes, selectedReviewPosition]);

  const goToNext = useCallback(() => {
    if (!canNavigateReview || selectedReviewPosition < 0) {
      return;
    }

    const nextReviewPosition =
      selectedReviewPosition === reviewStartIndexes.length - 1
        ? 0
        : selectedReviewPosition + 1;
    const nextIndex = reviewStartIndexes[nextReviewPosition];
    const nextImage = typeof nextIndex === 'number' ? images[nextIndex] : null;

    if (nextImage) {
      setReviewTransitionDirection('next');
      setSelectedIndex(nextIndex);
      setDetailSelectedImageId(nextImage.id);
      setIsDetailOpen(true);
    }
  }, [canNavigateReview, images, reviewStartIndexes, selectedReviewPosition]);

  const openDetailModal = (index: number) => {
    if (!images.length) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    setReviewTransitionDirection(null);
    setSelectedIndex(safeIndex);
    setDetailSelectedImageId(images[safeIndex]?.id ?? null);
    setIsDetailOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setDetailSelectedImageId(null);
  };

  useEffect(() => {
    if (!isOpen || images.length === 0) {
      setIsDetailOpen(false);
      setDetailSelectedImageId(null);
      setReviewTransitionDirection(null);
      hasInitializedOpenStateRef.current = false;
      return;
    }

    if (hasInitializedOpenStateRef.current) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(initialIndex, images.length - 1));
    setSelectedIndex(safeIndex);
    setDetailSelectedImageId(images[safeIndex]?.id ?? null);
    setReviewTransitionDirection(null);
    setIsDetailOpen(initialView === 'detail');
    hasInitializedOpenStateRef.current = true;
  }, [images, initialIndex, initialView, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsDetailOpen(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (!isDetailOpen || !canNavigateReview) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        goToPrev();
      }
      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canNavigateReview, goToNext, goToPrev, isDetailOpen, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || isDetailOpen) {
      return;
    }

    const target = tileRefs.current[selectedIndex];
    target?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [isDetailOpen, isOpen, selectedIndex]);

  useEffect(() => {
    setIsReviewContentExpanded(false);
  }, [selectedReviewId, isDetailOpen]);

  return {
    selectedIndex,
    isDetailOpen,
    tileRefs,
    detailViewProps:
      detailImage && selectedReview
        ? buildReviewGalleryDetailViewProps({
            detailImage,
            detailImageIndex,
            detailImages,
            selectedReview,
            selectedReviewId,
            selectedRating,
            helpfulCount,
            isHelpfulActive,
            isFeedbackPendingForSelected,
            canNavigateReview,
            canReturnToGallery,
            reviewTransitionDirection,
            reviewContentText,
            shouldShowContentToggle,
            isReviewContentExpanded,
            onToggleReviewContent: () =>
              setIsReviewContentExpanded((prev) => !prev),
            onFeedbackClick: handleSelectedFeedbackClick,
            onCloseDetail: closeDetailModal,
            onCloseModal: onClose,
            onPrev: goToPrev,
            onNext: goToNext,
            onSelectDetailImage: (imageId: number) =>
              setDetailSelectedImageId(imageId),
          })
        : null,
    openDetailModal,
  };
};
