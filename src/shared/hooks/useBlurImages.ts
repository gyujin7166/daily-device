import { useEffect, useMemo, useRef, useState } from 'react';

import { dynamicBlurDataUrl } from '@shared/lib/utils/dynamicBlurDataUrl';
import type { BaseImage, ImageWithBlur } from '@shared/types/image';

type UseBlurImagesOptions = {
  waitForBlur?: boolean;
};

const createImmediateImages = (
  images: BaseImage[],
  blurCache: Record<string, string> = {},
) =>
  images.map((photo) => ({
    ...photo,
    blurHash: blurCache[photo.image_url] ?? '',
  }));

/**
 * Blur placeholder는 원본 이미지 로딩 전에 먼저 표시되어야 하므로 캐시된 값은 즉시 반환하고,
 * 아직 없는 값만 비동기로 생성해 같은 URL의 반복 계산을 피한다.
 */
export const useBlurImages = (
  data: BaseImage[],
  options: UseBlurImagesOptions = {},
) => {
  const { waitForBlur = false } = options;
  const blurCache = useRef<Record<string, string>>({});
  const stableData = useMemo(() => data ?? [], [data]);
  const dataKey = JSON.stringify(stableData);
  const [imagesSet, setImagesSet] = useState<ImageWithBlur[]>(() =>
    waitForBlur ? [] : createImmediateImages(stableData),
  );

  // 동일한 이미지 목록이면 setState를 건너뛰어 blur 생성 후 불필요한 리렌더링을 줄인다.
  const isSameImagesSet = (prev: ImageWithBlur[], next: ImageWithBlur[]) =>
    prev.length === next.length &&
    prev.every((item, index) => {
      const nextItem = next[index];
      if (!nextItem) {
        return false;
      }

      const itemKeys = Object.keys(item);
      const nextItemKeys = Object.keys(nextItem);

      return (
        itemKeys.length === nextItemKeys.length &&
        itemKeys.every((key) => item[key] === nextItem[key])
      );
    });

  // 한 번 만든 blur 데이터는 이미지 URL 기준으로 캐싱해 같은 이미지의 재계산을 피한다.
  const getResources = async (images: BaseImage[]) => {
    const resources = await Promise.all(
      images.map(async (photo) => {
        if (blurCache.current[photo.image_url]) {
          return {
            ...photo,
            blurHash: blurCache.current[photo.image_url],
          };
        }

        const blurHash = await dynamicBlurDataUrl(
          photo.image_url,
          photo.image_width,
          photo.image_height,
        );
        blurCache.current[photo.image_url] = blurHash;

        return {
          ...photo,
          blurHash,
        };
      }),
    );

    return resources;
  };

  useEffect(() => {
    if (stableData.length === 0) {
      setImagesSet((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    let isCancelled = false;
    const immediateImages = createImmediateImages(
      stableData,
      blurCache.current,
    );
    const hasImmediateBlurImages = immediateImages.every(
      (image) => image.blurHash.length > 0,
    );

    // 캐시에 있는 blur 값은 먼저 반영하고, 없는 값은 비동기 생성이 끝난 뒤 한 번 더 갱신한다.
    if (!waitForBlur || hasImmediateBlurImages) {
      setImagesSet((prev) =>
        isSameImagesSet(prev, immediateImages) ? prev : immediateImages,
      );
    } else {
      setImagesSet((prev) => (prev.length === 0 ? prev : []));
    }

    const modifyData = async () => {
      const dataWithBlurHash = await getResources(stableData);
      if (!isCancelled) {
        setImagesSet((prev) =>
          isSameImagesSet(prev, dataWithBlurHash) ? prev : dataWithBlurHash,
        );
      }
    };

    modifyData();

    return () => {
      isCancelled = true;
    };
  }, [dataKey, stableData, waitForBlur]);

  return imagesSet;
};
