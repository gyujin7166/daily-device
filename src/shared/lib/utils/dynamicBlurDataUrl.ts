const OPTIMIZED_IMAGE_WIDTH = 64;
const OPTIMIZED_IMAGE_QUALITY = 75;
const BLUR_FALLBACK_WIDTH = 16;
const BLUR_FALLBACK_HEIGHT = 9;
const BLUR_REQUEST_TIMEOUT_MS = 8000;

export async function dynamicBlurDataUrl(
  url: string,
  width?: number | null,
  height?: number | null,
) {
  const toBase64FromBuffer = (arrayBuffer: ArrayBuffer) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(arrayBuffer).toString('base64');
    }

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return window.btoa(binary);
  };

  const toBase64 = (value: string) =>
    typeof window === 'undefined'
      ? Buffer.from(value).toString('base64')
      : window.btoa(value);

  const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${BLUR_FALLBACK_WIDTH}' height='${BLUR_FALLBACK_HEIGHT}' viewBox='0 0 ${BLUR_FALLBACK_WIDTH} ${BLUR_FALLBACK_HEIGHT}' preserveAspectRatio='none'><rect width='${BLUR_FALLBACK_WIDTH}' height='${BLUR_FALLBACK_HEIGHT}' fill='#d1d5db'/></svg>`;
  const fallbackDataUrl = `data:image/svg+xml;base64,${toBase64(fallbackSvg)}`;

  if (!url) {
    return fallbackDataUrl;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    BLUR_REQUEST_TIMEOUT_MS,
  );

  let base64str = '';
  let contentType = 'image/webp';

  try {
    // 원본 이미지를 직접 내려받지 않고 Next image optimizer를 거쳐 작은 preview만 가져온다.
    const optimizedUrl = `/_next/image?url=${encodeURIComponent(url)}&w=${OPTIMIZED_IMAGE_WIDTH}&q=${OPTIMIZED_IMAGE_QUALITY}`;
    const response = await fetch(optimizedUrl, {
      signal: abortController.signal,
    });

    if (!response.ok) {
      return fallbackDataUrl;
    }

    const arrayBuffer = await response.arrayBuffer();
    base64str = toBase64FromBuffer(arrayBuffer);
    contentType =
      response.headers.get('content-type')?.split(';')[0] ?? 'image/webp';
  } catch {
    return fallbackDataUrl;
  } finally {
    clearTimeout(timeoutId);
  }

  const safeWidth = width && width > 0 ? width : BLUR_FALLBACK_WIDTH;
  const safeHeight = height && height > 0 ? height : BLUR_FALLBACK_HEIGHT;

  // Next/Image blurDataURL은 data URL 하나만 받으므로 작은 이미지를 SVG 필터 안에 내장한다.
  const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${safeWidth}' height='${safeHeight}' viewBox='0 0 ${safeWidth} ${safeHeight}' preserveAspectRatio='none'>
      <filter id='b' color-interpolation-filters='sRGB'>
      <feColorMatrix type="matrix" 
            values="1 0 0 0 0
                    0 1 0 0 0 
                    0 0 1 0 0 
                    0 0 0 20 -10" />
      </filter>

      <image preserveAspectRatio='xMidYMid slice' filter='url(#b)' x='0' y='0' height='100%' width='100%'
      href='data:${contentType};base64,${base64str}' />
    </svg>
  `;

  return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
}
