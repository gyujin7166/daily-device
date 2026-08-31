import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';

import { getProductImagesBySelectedColor } from '@entities/product/model/productImages';
import type { ProductImageItem } from '@entities/product/model/types';
import { useProductImages } from '@entities/product/queries/useProductImages';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import {
  getCloudinaryImageUrl,
  isCloudinaryImageUrl,
} from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import ProductCarouselSkeleton from './ProductCarouselSkeleton';

type ProductImageCarouselProps = {
  detail?: string;
  selectedColorId?: number | null;
};

const getProductImageListKey = (images: ProductImageItem[]) =>
  images
    .map(
      (image) => `${image.id}:${image.productColorId ?? ''}:${image.image_url}`,
    )
    .join('|');

const VISIBLE_THUMBNAIL_COUNT = 5;

const getLastThumbnailStartIndex = (imageCount: number) =>
  Math.max(imageCount - VISIBLE_THUMBNAIL_COUNT, 0);

const clampThumbnailStartIndex = (startIndex: number, imageCount: number) =>
  Math.max(0, Math.min(startIndex, getLastThumbnailStartIndex(imageCount)));

const getThumbnailStartIndexForSelection = ({
  currentStartIndex,
  imageCount,
  selectedIndex,
}: {
  currentStartIndex: number;
  imageCount: number;
  selectedIndex: number;
}) => {
  const startIndex = clampThumbnailStartIndex(currentStartIndex, imageCount);
  const endIndex = Math.min(
    startIndex + VISIBLE_THUMBNAIL_COUNT - 1,
    imageCount - 1,
  );

  if (selectedIndex < startIndex) {
    return clampThumbnailStartIndex(selectedIndex, imageCount);
  }

  if (selectedIndex > endIndex) {
    return clampThumbnailStartIndex(
      selectedIndex - VISIBLE_THUMBNAIL_COUNT + 1,
      imageCount,
    );
  }

  return startIndex;
};

const getThumbnailStartIndexForClick = ({
  currentStartIndex,
  clickedIndex,
  imageCount,
}: {
  currentStartIndex: number;
  clickedIndex: number;
  imageCount: number;
}) => {
  const startIndex = clampThumbnailStartIndex(currentStartIndex, imageCount);
  const endIndex = Math.min(
    startIndex + VISIBLE_THUMBNAIL_COUNT - 1,
    imageCount - 1,
  );

  if (clickedIndex === startIndex && clickedIndex > 0) {
    return clampThumbnailStartIndex(startIndex - 1, imageCount);
  }

  if (clickedIndex === endIndex && clickedIndex < imageCount - 1) {
    return clampThumbnailStartIndex(startIndex + 1, imageCount);
  }

  return startIndex;
};

export default function ProductImageCarousel({
  detail,
  selectedColorId,
}: ProductImageCarouselProps) {
  const t = useTranslations('ProductDetail.media');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const thumbnailStartIndexRef = useRef(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const { data: productImages, isPending: productImagesIsPending } =
    useProductImages(detail);
  const resolvedImages = useMemo(
    () => getProductImagesBySelectedColor(productImages ?? [], selectedColorId),
    [productImages, selectedColorId],
  );
  const resolvedImagesKey = useMemo(
    () => getProductImageListKey(resolvedImages),
    [resolvedImages],
  );
  const [images, setImages] = useState<ProductImageItem[]>(
    () => resolvedImages,
  );
  const [pendingImages, setPendingImages] = useState<ProductImageItem[]>([]);
  const [loadedPendingImageUrls, setLoadedPendingImageUrls] = useState<
    Set<string>
  >(new Set());
  const imagesKey = useMemo(() => getProductImageListKey(images), [images]);
  const pendingImagesKey = useMemo(
    () => getProductImageListKey(pendingImages),
    [pendingImages],
  );
  const pendingImageUrls = useMemo(
    () =>
      Array.from(
        new Set(
          pendingImages
            .map((image) => image.image_url?.trim())
            .filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
        ),
      ),
    [pendingImages],
  );

  const updateThumbnailStartIndex = useCallback(
    (startIndex: number) => {
      const nextStartIndex = clampThumbnailStartIndex(
        startIndex,
        images.length,
      );
      thumbnailStartIndexRef.current = nextStartIndex;
      setThumbnailStartIndex(nextStartIndex);
    },
    [images.length],
  );

  const onThumbClick = (index: number) => {
    if (!emblaMainApi) {
      return;
    }

    updateThumbnailStartIndex(
      getThumbnailStartIndexForClick({
        currentStartIndex: thumbnailStartIndexRef.current,
        clickedIndex: index,
        imageCount: images.length,
      }),
    );
    emblaMainApi.scrollTo(index);
  };

  useEffect(() => {
    if (!emblaMainApi) {
      return;
    }

    const syncSelection = () => {
      const snap = emblaMainApi.selectedScrollSnap();
      selectedIndexRef.current = snap;
      setSelectedIndex(snap);
      updateThumbnailStartIndex(
        getThumbnailStartIndexForSelection({
          currentStartIndex: thumbnailStartIndexRef.current,
          imageCount: images.length,
          selectedIndex: snap,
        }),
      );
    };

    syncSelection();
    emblaMainApi.on('select', syncSelection);
    emblaMainApi.on('reInit', syncSelection);

    return () => {
      emblaMainApi.off('select', syncSelection);
      emblaMainApi.off('reInit', syncSelection);
    };
  }, [emblaMainApi, images.length, updateThumbnailStartIndex]);

  useEffect(() => {
    emblaThumbsApi?.scrollTo(thumbnailStartIndex);
  }, [emblaThumbsApi, thumbnailStartIndex]);

  useEffect(() => {
    if (!emblaThumbsApi) {
      return;
    }

    const syncThumbnailStartIndex = () => {
      updateThumbnailStartIndex(emblaThumbsApi.selectedScrollSnap());
    };

    emblaThumbsApi.on('select', syncThumbnailStartIndex);
    emblaThumbsApi.on('reInit', syncThumbnailStartIndex);

    return () => {
      emblaThumbsApi.off('select', syncThumbnailStartIndex);
      emblaThumbsApi.off('reInit', syncThumbnailStartIndex);
    };
  }, [emblaThumbsApi, updateThumbnailStartIndex]);

  useEffect(() => {
    const nextIndex = Math.max(
      0,
      Math.min(selectedIndexRef.current, images.length - 1),
    );
    const nextThumbnailStartIndex = getThumbnailStartIndexForSelection({
      currentStartIndex: thumbnailStartIndexRef.current,
      imageCount: images.length,
      selectedIndex: nextIndex,
    });

    selectedIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
    updateThumbnailStartIndex(nextThumbnailStartIndex);
    emblaMainApi?.reInit();
    emblaMainApi?.scrollTo(nextIndex);
    emblaThumbsApi?.reInit();
    emblaThumbsApi?.scrollTo(nextThumbnailStartIndex);
  }, [
    emblaMainApi,
    emblaThumbsApi,
    images.length,
    imagesKey,
    updateThumbnailStartIndex,
  ]);

  useEffect(() => {
    if (resolvedImagesKey === imagesKey) {
      return;
    }

    if (resolvedImages.length === 0) {
      setPendingImages([]);
      setLoadedPendingImageUrls(new Set());
      setImages([]);
      return;
    }

    const imageUrls = resolvedImages
      .map((image) => image.image_url?.trim())
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

    if (imageUrls.length === 0) {
      setPendingImages([]);
      setLoadedPendingImageUrls(new Set());
      setImages(resolvedImages);
      return;
    }

    if (images.length === 0) {
      setPendingImages([]);
      setLoadedPendingImageUrls(new Set());
      setImages(resolvedImages);
      return;
    }

    setPendingImages(resolvedImages);
    setLoadedPendingImageUrls(new Set());
  }, [images.length, imagesKey, resolvedImages, resolvedImagesKey]);

  useEffect(() => {
    if (pendingImages.length === 0) {
      return;
    }

    const didLoadAllPendingImages = pendingImageUrls.every((imageUrl) =>
      loadedPendingImageUrls.has(imageUrl),
    );

    if (!didLoadAllPendingImages) {
      return;
    }

    setImages(pendingImages);
    setPendingImages([]);
    setLoadedPendingImageUrls(new Set());
  }, [loadedPendingImageUrls, pendingImages, pendingImageUrls]);

  const handlePendingImageLoad = (imageUrl: string) => {
    setLoadedPendingImageUrls((prev) => {
      if (prev.has(imageUrl)) {
        return prev;
      }

      return new Set(prev).add(imageUrl);
    });
  };

  if (
    productImagesIsPending ||
    (resolvedImages.length > 0 && images.length === 0)
  ) {
    return <ProductCarouselSkeleton />;
  }

  if (!images.length) {
    return (
      <div className="rounded-[28px] bg-line dark:bg-dark-bg-hover">
        <picture className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px]">
          <Image
            src={IMAGE_FALLBACK_URL}
            alt={t('fallbackAlt')}
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            className="select-none object-contain opacity-80"
            draggable={false}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className="w-full">
      {pendingImages.length > 0 ? (
        <PendingProductImagesPreloader
          images={pendingImages}
          imagesKey={pendingImagesKey}
          onImageLoad={handlePendingImageLoad}
        />
      ) : null}
      <div className="rounded-[28px] bg-line dark:bg-dark-bg-hover">
        <div className="relative overflow-hidden rounded-[28px]">
          <div className="overflow-hidden" ref={emblaMainRef}>
            <div className="flex">
              {images.map((item, index) => (
                <div
                  className="min-w-0 flex-[0_0_100%]"
                  key={item.id ?? `${item.order}-${index}`}
                >
                  <picture className="flex aspect-square items-center justify-center">
                    <Image
                      src={getCloudinaryImageUrl(
                        item.image_url,
                        'productDetail',
                      )}
                      alt={t('imageAlt', { index: index + 1 })}
                      width={760}
                      height={760}
                      unoptimized={isCloudinaryImageUrl(item.image_url)}
                      sizes="(max-width: 1024px) 100vw, 760px"
                      className="h-full w-full select-none object-cover"
                      draggable={false}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden pt-1" ref={emblaThumbsRef}>
        <div className="flex gap-3">
          {images.map((item, index) => (
            <div
              key={item.id ?? `${item.order}-thumb-${index}`}
              className="min-w-0 flex-[0_0_auto]"
            >
              <button
                className={cn(
                  'relative select-none rounded-xl border-2 transition-colors',
                  index === selectedIndex
                    ? 'border-primary bg-line dark:bg-dark-bg-hover'
                    : 'border-line bg-line dark:border-dark-border dark:bg-dark-bg-hover hover:border-muted',
                )}
                onClick={() => onThumbClick(index)}
                type="button"
              >
                <picture className="block w-22 aspect-square overflow-hidden rounded-[10px] bg-line dark:bg-dark-bg-hover sm:w-26">
                  <Image
                    src={getCloudinaryImageUrl(
                      item.image_url,
                      'productThumbnail',
                    )}
                    alt={t('thumbnailAlt', { index: index + 1 })}
                    width={104}
                    height={104}
                    unoptimized={isCloudinaryImageUrl(item.image_url)}
                    sizes="(min-width: 640px) 104px, 88px"
                    className="h-full w-full select-none object-contain"
                    draggable={false}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PendingProductImagesPreloader({
  images,
  imagesKey,
  onImageLoad,
}: {
  images: ProductImageItem[];
  imagesKey: string;
  onImageLoad: (imageUrl: string) => void;
}) {
  return (
    <div
      key={imagesKey}
      className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      aria-hidden
    >
      {images.map((image, index) => {
        const imageUrl = image.image_url?.trim();

        if (!imageUrl) {
          return null;
        }

        return (
          <Image
            key={`${imageUrl}-${index}`}
            src={getCloudinaryImageUrl(imageUrl, 'productDetail')}
            alt=""
            width={760}
            height={760}
            unoptimized={isCloudinaryImageUrl(imageUrl)}
            sizes="(max-width: 1024px) 100vw, 760px"
            className="h-px w-px object-cover"
            draggable={false}
            loading="eager"
            onLoad={() => onImageLoad(imageUrl)}
            onError={() => onImageLoad(imageUrl)}
          />
        );
      })}
    </div>
  );
}
