import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MyOrdersContainer } from '@widgets/my-orders/ui/MyOrdersContainer';

import MyAddressContainer from '../address/ui/MyAddressContainer';
import MyOverviewPageContainer from '../overview/ui/MyOverviewPageContainer';
import MyWishlistContainer from '../wishlist/ui/MyWishlistContainer';

import type { Session } from 'next-auth';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'loading' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@tanstack/react-query', () => ({
  QueryErrorResetBoundary: ({
    children,
  }: {
    children: (value: { reset: () => void }) => ReactNode;
  }) => children({ reset: vi.fn() }),
}));

vi.mock('@features/my/ui', () => ({
  MyPageMobileMenuButton: () => null,
}));

vi.mock('@features/my/ui/skeletons', () => ({
  MyPageOverviewSkeleton: () => <div>overview-skeleton</div>,
}));

vi.mock('@features/my/ui/skeletons/MyAddressSkeleton', () => ({
  default: () => <div>address-skeleton</div>,
}));

vi.mock('@features/my/ui/skeletons/MyPageOrdersSkeleton', () => ({
  default: () => <div>orders-skeleton</div>,
}));

vi.mock('../address/ui/MyAddressContent', () => ({
  default: () => <div>address-content</div>,
}));

vi.mock('../overview/ui/MyOverviewContent', () => ({
  default: () => <div>overview-content</div>,
}));

vi.mock('../wishlist/ui/MyWishlistContent', () => ({
  default: () => <div>wishlist-content</div>,
}));

vi.mock('@widgets/my-orders/ui/MyOrdersContent', () => ({
  default: () => <div>orders-content</div>,
}));

const session = {
  expires: '2099-01-01T00:00:00.000Z',
  user: { id: 'user-1', name: 'Tester' },
} as Session;

describe('서버에서 보호되는 마이페이지 컨테이너', () => {
  it.each([
    ['overview', () => <MyOverviewPageContainer session={session} />],
    ['address', () => <MyAddressContainer />],
    ['wishlist', () => <MyWishlistContainer />],
    ['orders', () => <MyOrdersContainer embedded />],
  ])(
    '클라이언트 세션 로딩과 무관하게 %s hydration 콘텐츠를 표시한다',
    (page, createView) => {
      render(createView());

      expect(screen.getByText(`${page}-content`)).toBeInTheDocument();
    },
  );
});
