type ProductImageLike = {
  image_url: string | null;
  isMain?: boolean | null;
  productColorId?: number | null;
  order?: number | null;
};

const getDefaultProductImages = <T extends ProductImageLike>(images: T[]) =>
  images.filter(
    (image) => image.productColorId == null && image.image_url?.trim(),
  );

export const getProductImagesBySelectedColor = <T extends ProductImageLike>(
  images: T[],
  selectedColorId?: number | null,
) => {
  const selectedColorImages =
    selectedColorId == null
      ? []
      : images.filter(
          (image) =>
            image.productColorId === selectedColorId && image.image_url?.trim(),
        );
  const defaultImages = getDefaultProductImages(images);

  if (selectedColorImages.length > 0) {
    return selectedColorImages;
  }

  if (defaultImages.length > 0) {
    return defaultImages;
  }

  return images.filter((image) => image.image_url?.trim());
};

export const getProductThumbnailUrlBySelectedColor = <
  T extends ProductImageLike,
>(
  images: T[] | undefined,
  selectedColorId?: number | null,
) => {
  const imageList = images ?? [];
  const resolvedImages = getProductImagesBySelectedColor(
    imageList,
    selectedColorId,
  );
  const thumbnailImage =
    resolvedImages.find((image) => image.order === 1)?.image_url?.trim() ??
    resolvedImages.find((image) => !image.isMain)?.image_url?.trim() ??
    resolvedImages.find((image) => image.isMain)?.image_url?.trim() ??
    resolvedImages[0]?.image_url?.trim();

  return thumbnailImage ?? null;
};
