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
    throw new Error('Cloudinary cloud name이 설정되지 않았습니다.');
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
    throw new Error('jpg, png, webp, heic 이미지만 업로드할 수 있습니다.');
  }

  if (file.size > getCloudinaryUploadMaxSizeBytes(maxSizeMb)) {
    throw new Error(`이미지는 ${maxSizeMb}MB 이하만 업로드할 수 있습니다.`);
  }
};

const getCloudinaryResponseErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };

    return body.error?.message ?? body.message ?? response.statusText;
  } catch {
    return response.statusText;
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
    throw new Error(await getCloudinaryResponseErrorMessage(response));
  }

  const body: unknown = await response.json();

  if (!isCloudinarySignResponse(body)) {
    throw new Error('Cloudinary 서명을 받지 못했습니다.');
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
    throw new Error(await getCloudinaryResponseErrorMessage(response));
  }

  const body: unknown = await response.json();

  if (!isCloudinaryUploadResponse(body)) {
    throw new Error('업로드된 이미지 정보를 받지 못했습니다.');
  }

  return {
    image_url: body.secure_url,
    public_id: body.public_id,
  };
};
