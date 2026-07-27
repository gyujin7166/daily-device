'use client';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import type { MyTab } from '@shared/constants/myRoutes';
import { useRequireAuth } from '@shared/hooks/auth/useRequireAuth';
import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import { MyPageLoadingContext } from '../model/context/MyPageLoadingContext';
import { MyPageMobileMenuContext } from '../model/context/MyPageMobileMenuContext';
import { useMyPageShellState } from '../model/hooks/useMyPageShellState';

import MyPageContentFallback from './MyPageContentFallback';
import MyPageLoadingOverlay from './MyPageLoadingOverlay';
import MyPageMobileMenuDialog from './MyPageMobileMenuDialog';
import MyPageTabNavigation from './MyPageTabNavigation';

type MyPageShellProps = {
  activeTab: MyTab;
  children: ReactNode;
};

export default function MyPageShell({ activeTab, children }: MyPageShellProps) {
  const t = useTranslations('MyPage.shell');
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
    <MyPageLoadingContext.Provider
      value={{ isTabTransitionPending: isContentPending }}
    >
      <MyPageMobileMenuContext.Provider value={mobileMenuContextValue}>
        <div className="flex min-h-screen flex-col bg-canvas pb-16 pt-27.5 dark:bg-dark-bg">
          <PageWrapper className="flex flex-1">
            <div className="relative flex flex-1 flex-col rounded-3xl py-6 md:py-8 lg:py-6">
              <MyPageTabNavigation
                activeTab={visualActiveTab}
                variant="tablet"
                onTabLinkClick={handleTabLinkClick}
              />

              <div className="relative grid flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
                <MyPageTabNavigation
                  activeTab={visualActiveTab}
                  variant="desktop"
                  onTabLinkClick={handleTabLinkClick}
                />

                <main className="min-w-0">
                  <div className="relative h-full">
                    <div
                      className={cn(
                        'transition-all duration-200',
                        isContentPending
                          ? 'pointer-events-none select-none opacity-80 blur-[1px]'
                          : 'opacity-100 blur-0',
                      )}
                    >
                      <Suspense
                        fallback={
                          <MyPageContentFallback tab={visualActiveTab} />
                        }
                      >
                        {children}
                      </Suspense>
                    </div>

                    {isContentPending ? (
                      <MyPageLoadingOverlay
                        label={t('loadingTab')}
                        centerInViewport
                        className="z-50"
                      />
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
    </MyPageLoadingContext.Provider>
  );
}
