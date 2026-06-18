import 'server-only';

import sharp from 'sharp';

import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';

const BLUR_IMAGE_SIZE = 16;
const BLUR_IMAGE_QUALITY = 45;
const BLUR_FETCH_TIMEOUT_MS = 8000;

export async function createBlurDataUrl(
  imageUrl: string,
): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    BLUR_FETCH_TIMEOUT_MS,
  );

  try {
    const sourceUrl = getCloudinaryImageUrl(imageUrl, 'reviewBlurPlaceholder');
    const response = await fetch(sourceUrl, {
      signal: abortController.signal,
    });

    if (!response.ok) {
      return null;
    }

    const inputBuffer = Buffer.from(await response.arrayBuffer());
    const outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(BLUR_IMAGE_SIZE, BLUR_IMAGE_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .blur()
      .webp({ quality: BLUR_IMAGE_QUALITY })
      .toBuffer();

    return `data:image/webp;base64,${outputBuffer.toString('base64')}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
