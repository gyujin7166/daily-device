export type CloudinaryImageVariant =
  | 'categoryThumbnail'
  | 'hero'
  | 'homeCard'
  | 'orderThumbnail'
  | 'productCard'
  | 'productDetail'
  | 'productThumbnail'
  | 'reviewPreview'
  | 'reviewDetail'
  | 'reviewBlurPlaceholder';
export type CloudinaryReviewImageVariant = 'preview' | 'detail';

const CLOUDINARY_UPLOAD_PATH = '/image/upload/';

const CLOUDINARY_IMAGE_TRANSFORMATIONS: Record<CloudinaryImageVariant, string> =
  {
    categoryThumbnail: 'c_limit,w_480,q_auto,f_auto',
    hero: 'c_limit,w_2400,q_auto,f_auto',
    homeCard: 'c_limit,w_1200,q_auto,f_auto',
    orderThumbnail: 'c_limit,w_320,q_auto,f_auto',
    productCard: 'c_limit,w_640,q_auto,f_auto',
    productDetail: 'c_limit,w_1200,q_auto,f_auto',
    productThumbnail: 'c_limit,w_240,q_auto,f_auto',
    reviewPreview: 'c_fill,g_auto,w_320,h_320,q_auto,f_auto',
    reviewDetail: 'c_limit,w_1200,q_auto,f_auto',
    reviewBlurPlaceholder: 'c_fill,g_auto,w_48,h_48,q_50,f_auto',
  };

const REVIEW_IMAGE_VARIANT_MAP: Record<
  CloudinaryReviewImageVariant,
  CloudinaryImageVariant
> = {
  preview: 'reviewPreview',
  detail: 'reviewDetail',
};

const isCloudinaryImageUrl = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);

    return (
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.includes(CLOUDINARY_UPLOAD_PATH)
    );
  } catch {
    return false;
  }
};

const hasCloudinaryTransformation = (imageUrl: string) => {
  const [, pathAfterUpload] = imageUrl.split(CLOUDINARY_UPLOAD_PATH);
  const firstPathSegment = pathAfterUpload?.split('/')[0] ?? '';

  return firstPathSegment.includes(',') || /^[a-z]_.+/.test(firstPathSegment);
};

/**
 * Cloudinary URL인 경우에만 transformation을 삽입한다.
 * DB에는 원본 URL을 유지하고, 화면의 표시 크기에 맞는 변환 URL만 렌더링 단계에서 사용한다.
 */
export const getCloudinaryImageUrl = (
  imageUrl: string,
  variant: CloudinaryImageVariant,
) => {
  if (
    !isCloudinaryImageUrl(imageUrl) ||
    hasCloudinaryTransformation(imageUrl)
  ) {
    return imageUrl;
  }

  const transformation = CLOUDINARY_IMAGE_TRANSFORMATIONS[variant];

  return imageUrl.replace(
    CLOUDINARY_UPLOAD_PATH,
    `${CLOUDINARY_UPLOAD_PATH}${transformation}/`,
  );
};

export const getCloudinaryReviewImageUrl = (
  imageUrl: string,
  variant: CloudinaryReviewImageVariant,
) => {
  return getCloudinaryImageUrl(imageUrl, REVIEW_IMAGE_VARIANT_MAP[variant]);
};
