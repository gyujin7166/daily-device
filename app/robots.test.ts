import { describe, expect, it } from 'vitest';

import robots from './robots';

describe('robots metadata route', () => {
  it('모든 crawler에 공개 경로 접근을 허용하고 noindex 페이지를 차단하지 않는다', () => {
    expect(robots().rules).toEqual({
      userAgent: '*',
      allow: '/',
    });
  });

  it('production sitemap의 absolute URL을 안내한다', () => {
    expect(robots().sitemap).toBe(
      'https://daily-device.vercel.app/sitemap.xml',
    );
  });
});
