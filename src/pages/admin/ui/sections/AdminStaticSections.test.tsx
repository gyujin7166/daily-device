import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminFeedbackSection from './AdminFeedbackSection';
import AdminPageHeaderSection from './AdminPageHeaderSection';
import AdminTabSection from './AdminTabSection';

const mocks = vi.hoisted(() => ({
  translationNamespaces: [] as string[],
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    mocks.translationNamespaces.push(namespace);
    return (key: string) => key;
  },
}));

vi.mock('@shared/hooks/useThemeMode', () => ({
  useThemeMode: () => ({
    mounted: true,
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

const handleRefresh = vi.fn();
const handleTabChange = vi.fn();

describe('관리자 페이지 정적 영역', () => {
  beforeEach(() => {
    mocks.translationNamespaces = [];
  });

  it.each([
    [
      'Admin.header',
      () => <AdminPageHeaderSection onRefresh={handleRefresh} />,
    ],
    [
      'Admin.tabs',
      () => (
        <AdminTabSection activeTab="heroes" onTabChange={handleTabChange} />
      ),
    ],
    [
      'Admin.feedback',
      () => <AdminFeedbackSection canWriteAdmin message="" error="" />,
    ],
  ])(
    '부모의 관련 없는 렌더에서 %s 영역을 다시 렌더하지 않는다',
    (namespace, createView) => {
      const { rerender } = render(createView());

      rerender(createView());

      expect(
        mocks.translationNamespaces.filter((item) => item === namespace),
      ).toHaveLength(1);
    },
  );
});
