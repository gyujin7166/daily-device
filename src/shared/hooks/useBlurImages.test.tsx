import { renderHook, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { BaseImage } from '@shared/types/image';

import { useBlurImages } from './useBlurImages';

vi.mock('@shared/lib/utils/dynamicBlurDataUrl', () => ({
  dynamicBlurDataUrl: vi.fn().mockResolvedValue('data:image/mock'),
}));

const createHeroImage = (name: string, description: string): BaseImage => ({
  id: 1,
  image_url: 'https://example.com/hero.jpg',
  name_en: name,
  description,
});

function HeroImageCount({ images }: { images: BaseImage[] }) {
  const imagesSet = useBlurImages(images);

  return <span>{imagesSet.length}</span>;
}

describe('useBlurImages', () => {
  it('blur 생성을 기다리지 않는 경우 첫 렌더부터 원본 이미지를 반환한다', () => {
    const heroImage = createHeroImage('All products', 'Browse all products.');
    const html = renderToString(<HeroImageCount images={[heroImage]} />);

    expect(html).toContain('<span>1</span>');
  });

  it('같은 이미지의 locale별 콘텐츠가 변경되면 메타데이터를 갱신한다', async () => {
    const { result, rerender } = renderHook(
      ({ images }: { images: BaseImage[] }) => useBlurImages(images),
      {
        initialProps: {
          images: [createHeroImage('전체 상품', '모든 상품을 확인하세요.')],
        },
      },
    );

    await waitFor(() => {
      expect(result.current[0]?.description).toBe('모든 상품을 확인하세요.');
    });

    rerender({
      images: [createHeroImage('All products', 'Browse all products.')],
    });

    await waitFor(() => {
      expect(result.current[0]?.name_en).toBe('All products');
      expect(result.current[0]?.description).toBe('Browse all products.');
    });
  });
});
