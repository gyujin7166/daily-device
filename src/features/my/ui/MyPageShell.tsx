'use client';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import type { MyTab } from '@shared/constants/myRoutes';
import { useRequireAuth } from '@shared/hooks/auth/useRequireAuth';
import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import { MyPageMobileMenuContext } from '../model/context/MyPageMobileMenuContext';
import { useMyPageShellState } from '../model/hooks/useMyPageShellState';

import MyPageContentFallback from './MyPageContentFallback';
import MyPageMobileMenuDialog from './MyPageMobileMenuDialog';
import MyPageTabNavigation from './MyPageTabNavigation';

type MyPageShellProps = {
  activeTab: MyTab;
  children: ReactNode;
};

export default function MyPageShell({ activeTab, children }: MyPageShellProps) {
  useRequireAuth();
  const {
    isMobileMenuOpen,
    visualActiveTab,
    isContentPending,
    mobileMenuContextValue,
    handleCloseMobileMenu,
    handleTabLinkClick,
  } = useMyPageShellState(activeTab);

  return (
    <MyPageMobileMenuContext.Provider value={mobileMenuContextValue}>
      <div className="min-h-screen bg-canvas pb-16 pt-27.5 dark:bg-dark-bg">
        <PageWrapper>
          <div className="relative rounded-3xl py-6 md:py-8 lg:py-6">
            <MyPageTabNavigation
              activeTab={visualActiveTab}
              variant="tablet"
              onTabLinkClick={handleTabLinkClick}
            />

            <div className="relative grid items-start gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
              <MyPageTabNavigation
                activeTab={visualActiveTab}
                variant="desktop"
                onTabLinkClick={handleTabLinkClick}
              />

              <main className="min-w-0">
                <div className="relative">
                  <div
                    className={cn(
                      'transition-all duration-200',
                      isContentPending
                        ? 'pointer-events-none select-none opacity-80 blur-[1px]'
                        : 'opacity-100 blur-0',
                    )}
                  >
                    <Suspense
                      fallback={<MyPageContentFallback tab={visualActiveTab} />}
                    >
                      {children}
                    </Suspense>
                  </div>

                  {isContentPending ? (
                    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface/95 shadow-xs dark:border-dark-border dark:bg-dark-panel/95">
                        <Spinner size="sm" />
                        <span className="sr-only">마이페이지 탭 불러오는 중</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </main>
            </div>
          </div>
        </PageWrapper>
      </div>

      <MyPageMobileMenuDialog
        isOpen={isMobileMenuOpen}
        activeTab={visualActiveTab}
        onClose={handleCloseMobileMenu}
        onTabLinkClick={handleTabLinkClick}
      />
    </MyPageMobileMenuContext.Provider>
  );
}
