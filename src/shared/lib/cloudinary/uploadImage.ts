import { CLOUDINARY_UPLOAD_ERROR_CODE } from '@shared/constants/cloudinaryUploadErrorCode';
import type { CloudinaryUploadErrorCode } from '@shared/constants/cloudinaryUploadErrorCode';

export type CloudinaryUploadTarget =
  | {
      target: 'product';
      categoryId: number;
      productSlug: string;
      colorId?: number | null;
    }
  | {
      target: 'hero';
      heroTypeId: number;
    }
  | {
      target: 'review';
      orderItemId: number;
    };

export type UploadedCloudinaryImage = {
  image_url: string;
  public_id: string;
};

type CloudinarySignResponse = {
  apiKey: string;
  signature: string;
  params: Record<string, string | number>;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

export class CloudinaryUploadError extends Error {
  constructor(
    message: string,
    public code: CloudinaryUploadErrorCode,
    public details?: string,
  ) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

export const cloudinaryUploadErrorKeyByCode = {
  [CLOUDINARY_UPLOAD_ERROR_CODE.CLOUD_NAME_MISSING]: 'cloudNameMissing',
  [CLOUDINARY_UPLOAD_ERROR_CODE.INVALID_IMAGE_TYPE]: 'invalidImageType',
  [CLOUDINARY_UPLOAD_ERROR_CODE.IMAGE_TOO_LARGE]: 'imageTooLarge',
  [CLOUDINARY_UPLOAD_ERROR_CODE.SIGNATURE_REQUEST_FAILED]:
    'signatureRequestFailed',
  [CLOUDINARY_UPLOAD_ERROR_CODE.SIGNATURE_RESPONSE_INVALID]:
    'signatureResponseInvalid',
  [CLOUDINARY_UPLOAD_ERROR_CODE.UPLOAD_REQUEST_FAILED]: 'uploadRequestFailed',
  [CLOUDINARY_UPLOAD_ERROR_CODE.UPLOAD_RESPONSE_INVALID]:
    'uploadResponseInvalid',
  [CLOUDINARY_UPLOAD_ERROR_CODE.PRODUCT_CATEGORY_NOT_FOUND]:
    'productCategoryNotFound',
  [CLOUDINARY_UPLOAD_ERROR_CODE.PRODUCT_COLOR_NOT_FOUND]:
    'productColorNotFound',
  [CLOUDINARY_UPLOAD_ERROR_CODE.HERO_TYPE_NOT_FOUND]: 'heroTypeNotFound',
  [CLOUDINARY_UPLOAD_ERROR_CODE.HERO_TYPE_UNSUPPORTED]: 'heroTypeUnsupported',
  [CLOUDINARY_UPLOAD_ERROR_CODE.REVIEW_ORDER_ITEM_NOT_FOUND]:
    'reviewOrderItemNotFound',
  [CLOUDINARY_UPLOAD_ERROR_CODE.CLOUDINARY_CONFIG_MISSING]:
    'cloudinaryConfigMissing',
  [CLOUDINARY_UPLOAD_ERROR_CODE.CLOUDINARY_UPLOAD_PRESET_MISSING]:
    'cloudinaryUploadPresetMissing',
} as const;

const CLOUDINARY_DEFAULT_UPLOAD_MAX_SIZE_MB = 5;
export const CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB = 10;
const CLOUDINARY_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
const CLOUDINARY_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
];
const CLOUDINARY_JPG_CONVERT_IMAGE_TYPES = ['image/heic', 'image/heif'];
const CLOUDINARY_JPG_CONVERT_IMAGE_EXTENSIONS = ['heic', 'heif'];

const isCloudinarySignResponse = (
  value: unknown,
): value is CloudinarySignResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CloudinarySignResponse).apiKey === 'string' &&
    typeof (value as CloudinarySignResponse).signature === 'string' &&
    typeof (value as CloudinarySignResponse).params === 'object' &&
    (value as CloudinarySignResponse).params !== null
  );
};

const isCloudinaryUploadResponse = (
  value: unknown,
): value is CloudinaryUploadResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CloudinaryUploadResponse).secure_url === 'string' &&
    typeof (value as CloudinaryUploadResponse).public_id === 'string'
  );
};

const getCloudinaryUploadUrl = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new CloudinaryUploadError(
      'Cloudinary cloud name is not configured.',
      CLOUDINARY_UPLOAD_ERROR_CODE.CLOUD_NAME_MISSING,
    );
  }

  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
};

const getFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop();

  return extension?.toLowerCase() ?? '';
};

const shouldConvertToJpg = (file: File) => {
  const extension = getFileExtension(file.name);

  return (
    CLOUDINARY_JPG_CONVERT_IMAGE_TYPES.includes(file.type) ||
    CLOUDINARY_JPG_CONVERT_IMAGE_EXTENSIONS.includes(extension)
  );
};

const getCloudinaryUploadMaxSizeBytes = (maxSizeMb: number) =>
  maxSizeMb * 1024 * 1024;

export const assertValidCloudinaryImageFile = (
  file: File,
  maxSizeMb = CLOUDINARY_DEFAULT_UPLOAD_MAX_SIZE_MB,
) => {
  const extension = getFileExtension(file.name);
  const hasAllowedMimeType = CLOUDINARY_ALLOWED_IMAGE_TYPES.includes(file.type);
  const hasAllowedExtension =
    CLOUDINARY_ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    throw new CloudinaryUploadError(
      'Only jpg, png, webp, and heic images can be uploaded.',
      CLOUDINARY_UPLOAD_ERROR_CODE.INVALID_IMAGE_TYPE,
    );
  }

  if (file.size > getCloudinaryUploadMaxSizeBytes(maxSizeMb)) {
    throw new CloudinaryUploadError(
      `Images must be ${maxSizeMb}MB or smaller.`,
      CLOUDINARY_UPLOAD_ERROR_CODE.IMAGE_TOO_LARGE,
      String(maxSizeMb),
    );
  }
};

const getCloudinaryResponseError = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      code?: string;
      error?: { message?: string };
      message?: string;
    };

    return {
      code: body.code,
      message: body.error?.message ?? body.message ?? response.statusText,
    };
  } catch {
    return { code: undefined, message: response.statusText };
  }
};

const getCloudinarySignature = async (
  target: CloudinaryUploadTarget,
  file: File,
) => {
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...target,
      imageName: file.name,
      ...(shouldConvertToJpg(file) ? { format: 'jpg' } : {}),
    }),
  });

  if (!response.ok) {
    const responseError = await getCloudinaryResponseError(response);
    throw new CloudinaryUploadError(
      responseError.message,
      responseError.code &&
        Object.values(CLOUDINARY_UPLOAD_ERROR_CODE).includes(
          responseError.code as CloudinaryUploadErrorCode,
        )
        ? (responseError.code as CloudinaryUploadErrorCode)
        : CLOUDINARY_UPLOAD_ERROR_CODE.SIGNATURE_REQUEST_FAILED,
      responseError.message,
    );
  }

  const body: unknown = await response.json();

  if (!isCloudinarySignResponse(body)) {
    throw new CloudinaryUploadError(
      'Cloudinary signature response is invalid.',
      CLOUDINARY_UPLOAD_ERROR_CODE.SIGNATURE_RESPONSE_INVALID,
    );
  }

  return body;
};

export const uploadCloudinaryImage = async ({
  file,
  target,
}: {
  file: File;
  target: CloudinaryUploadTarget;
}): Promise<UploadedCloudinaryImage> => {
  assertValidCloudinaryImageFile(
    file,
    target.target === 'review'
      ? CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB
      : CLOUDINARY_DEFAULT_UPLOAD_MAX_SIZE_MB,
  );

  const { apiKey, signature, params } = await getCloudinarySignature(
    target,
    file,
  );
  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const responseError = await getCloudinaryResponseError(response);
    throw new CloudinaryUploadError(
      responseError.message,
      CLOUDINARY_UPLOAD_ERROR_CODE.UPLOAD_REQUEST_FAILED,
      responseError.message,
    );
  }

  const body: unknown = await response.json();

  if (!isCloudinaryUploadResponse(body)) {
    throw new CloudinaryUploadError(
      'Cloudinary upload response is invalid.',
      CLOUDINARY_UPLOAD_ERROR_CODE.UPLOAD_RESPONSE_INVALID,
    );
  }

  return {
    image_url: body.secure_url,
    public_id: body.public_id,
  };
};
