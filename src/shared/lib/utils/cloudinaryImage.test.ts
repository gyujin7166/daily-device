import { describe, expect, it } from 'vitest';

import { getCloudinaryImageUrl, isCloudinaryImageUrl } from './cloudinaryImage';

describe('cloudinaryImage', () => {
  const cloudinaryUrl =
    'https://res.cloudinary.com/daily-device/image/upload/v123/products/mouse.jpg';

  it('Cloudinary 업로드 이미지에 용도별 transformation을 적용한다', () => {
    expect(getCloudinaryImageUrl(cloudinaryUrl, 'productCard')).toBe(
      'https://res.cloudinary.com/daily-device/image/upload/c_limit,w_640,q_auto,f_auto/v123/products/mouse.jpg',
    );
  });

  it('전체 폭 Hero 이미지에 1920px transformation을 적용한다', () => {
    expect(getCloudinaryImageUrl(cloudinaryUrl, 'hero')).toBe(
      'https://res.cloudinary.com/daily-device/image/upload/c_limit,w_1920,q_auto,f_auto/v123/products/mouse.jpg',
    );
  });

  it('로컬 fallback URL은 원본을 유지한다', () => {
    expect(getCloudinaryImageUrl('/images/fallback.webp', 'homeCard')).toBe(
      '/images/fallback.webp',
    );
  });

  it.each([
    cloudinaryUrl,
    'https://res.cloudinary.com/daily-device/image/upload/c_limit,w_640,q_auto,f_auto/v123/products/mouse.jpg',
  ])('Cloudinary 업로드 URL을 판별한다: %s', (imageUrl) => {
    expect(isCloudinaryImageUrl(imageUrl)).toBe(true);
  });

  it.each([
    '/images/fallback.webp',
    'blob:http://localhost/review-preview',
    'https://lh3.googleusercontent.com/profile.jpg',
    'https://res.cloudinary.com/daily-device/raw/upload/file.json',
    'invalid-url',
  ])('Cloudinary 이미지가 아닌 URL을 제외한다: %s', (imageUrl) => {
    expect(isCloudinaryImageUrl(imageUrl)).toBe(false);
  });
});
