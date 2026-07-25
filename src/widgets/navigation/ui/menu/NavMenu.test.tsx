import type React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NavMenu from './NavMenu';

const mocks = vi.hoisted(() => ({
  prefetch: vi.fn(),
  useCategory: vi.fn(() => ({
    data: [
      {
        id: 1,
        name_en: 'Pointing Devices',
        name_ko: '포인팅 장치',
        slug: 'pointing-devices',
        image_url: null,
        displayOrder: 1,
        children: [
          {
            id: 2,
            name_en: 'Mice',
            name_ko: '마우스',
            slug: 'mice',
            displayOrder: 1,
          },
        ],
      },
    ],
    isLoading: false,
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@entities/product/queries/useCategory', () => ({
  useCategory: mocks.useCategory,
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    onClick,
    ...props
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: () => '/products/mice',
  useRouter: () => ({ prefetch: mocks.prefetch }),
}));

describe('NavMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('드롭다운을 열기 전에도 카테고리 데이터를 요청한다', () => {
    render(
      <NavMenu
        isDropdownOpen={false}
        handleMouseEnter={vi.fn()}
        handleMouseLeave={vi.fn()}
        handleMouseMove={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(mocks.useCategory).toHaveBeenCalledOnce();
  });

  it('현재 카테고리를 다시 클릭하면 활성 상태를 유지하면서 드롭다운 닫기를 요청한다', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <NavMenu
        isDropdownOpen
        handleMouseEnter={vi.fn()}
        handleMouseLeave={vi.fn()}
        handleMouseMove={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    const currentCategoryLink = screen.getByRole('link', { name: '마우스' });

    expect(currentCategoryLink).toHaveAttribute('href', '/products/mice');
    expect(currentCategoryLink).toHaveAttribute('aria-current', 'page');

    await user.click(currentCategoryLink);

    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
