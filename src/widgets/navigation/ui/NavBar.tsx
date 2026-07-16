import { useEffect, useRef } from 'react';
import type React from 'react';

import { IconMenu2, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useSearchSuggestion } from '@features/search/queries/useSearchSuggestion';
import { SearchBar, SearchSuggestion } from '@features/search/ui';

import { useDropdown } from '@shared/hooks/useDropdown';
import { usePathname } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';
import { useHeroNavToneContext } from '@shared/model/context/HeroNavToneContext';
import Logo from '@shared/ui/Logo/Logo';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import useNavBarState from '../model/hooks/useNavBarState';
import useScrollHeader from '../model/hooks/useScrollHeader';
import useSearch from '../model/hooks/useSearch';

import NavActions from './actions/NavActions';
import MobileNavMenu from './menu/MobileNavMenu';
import NavMenu from './menu/NavMenu';

export default function NavBar() {
  const t = useTranslations('Navigation.menu');
  const pathname = usePathname();
  const searchLayerRef = useRef<HTMLDivElement | null>(null);
  const { heroNavTone } = useHeroNavToneContext();
  const {
    inputText,
    highlightedText,
    showSearchBar,
    setShowSearchBar,
    showSearchSuggestion,
    setShowSearchSuggestion,
    handleSearchInputChange,
    handleToggleSearch,
    updateHighlightedText,
  } = useSearch();
  const {
    data: searchSuggestions,
    isPending,
    isFetching,
    isDebouncing,
    debouncedKeyword,
  } = useSearchSuggestion(inputText);
  const { headerVisible, isAtTop } = useScrollHeader();
  const { isDropdownOpen, setIsDropdownOpen } = useDropdown();
  const {
    isMobileMenuOpen,
    isMobileShopOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleCloseMobileMenu,
    handleToggleMobileMenu,
    handleToggleMobileShop,
    handleToggleSearchWithClose,
  } = useNavBarState({
    headerVisible,
    routerPath: pathname ?? '/',
    setIsDropdownOpen,
    handleToggleSearch,
  });
  const isLoading =
    isPending || isFetching || isDebouncing || inputText !== debouncedKeyword;
  const routeSegments = pathname?.split('/').filter(Boolean) ?? [];
  const isProductDetailPage =
    routeSegments[0] === 'products' && routeSegments.length >= 3;
  const shouldUseDefaultTopContent =
    isProductDetailPage ||
    pathname?.startsWith('/my') ||
    pathname?.startsWith('/search') ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/cookies';
  const isSearchHeaderOpen = showSearchBar;
  const useTopTransparentHeader = isAtTop && !isMobileMenuOpen;
  const useTopOverlayHeader =
    useTopTransparentHeader && !shouldUseDefaultTopContent;
  const useSearchOverlayHeader = isSearchHeaderOpen && !isMobileMenuOpen;
  const useTransparentHeader =
    useTopTransparentHeader || useSearchOverlayHeader;
  const useLightOverlayContent = useTopOverlayHeader && heroNavTone !== 'dark';
  const useDarkOverlayContent = useTopOverlayHeader && heroNavTone === 'dark';
  const shouldKeepHeaderVisible =
    headerVisible || isSearchHeaderOpen || isMobileMenuOpen;
  const navContentVisibilityClassName = cn(
    'transition-all duration-150 ease-out',
    isSearchHeaderOpen
      ? 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'
      : 'opacity-100',
  );

  useEffect(() => {
    if (!isDebouncing && !isFetching && searchSuggestions) {
      if (inputText === debouncedKeyword) {
        updateHighlightedText(inputText, searchSuggestions);
      }
    }
  }, [
    inputText,
    debouncedKeyword,
    isDebouncing,
    isFetching,
    searchSuggestions,
    updateHighlightedText,
  ]);

  useEffect(() => {
    if (!showSearchBar) {
      return;
    }

    const handleClickOutsideSearch = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && searchLayerRef.current?.contains(target)) {
        return;
      }

      setShowSearchBar(false);
      setShowSearchSuggestion(false);
    };

    document.addEventListener('click', handleClickOutsideSearch);

    return () => {
      document.removeEventListener('click', handleClickOutsideSearch);
    };
  }, [setShowSearchBar, setShowSearchSuggestion, showSearchBar]);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleCloseMobileMenu();

    if (pathname !== '/') {
      return;
    }

    event.preventDefault();
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative">
      <nav
        className={cn(
          'fixed z-40 h-22.5 w-full transition-[top] duration-200 lg:transition-[top,border-color,box-shadow,background-color,backdrop-filter]',
          useTransparentHeader
            ? cn(
                'border-b border-transparent bg-transparent shadow-none',
                useTopOverlayHeader
                  ? useLightOverlayContent
                    ? 'text-surface'
                    : 'text-ink'
                  : 'text-ink dark:text-surface',
              )
            : 'border-b border-line bg-surface text-ink shadow-xs dark:border-dark-border dark:bg-dark-panel dark:text-surface',
          !useTransparentHeader && isAtTop
            ? 'border-transparent shadow-none'
            : '',
          shouldKeepHeaderVisible ? 'top-0' : '-top-22.5',
        )}
      >
        <PageWrapper className="relative flex h-full items-center md:px-8">
          <div
            className={cn(
              'flex min-w-0 items-center gap-1.5 lg:flex-1 lg:gap-2',
              navContentVisibilityClassName,
            )}
          >
            <button
              type="button"
              onClick={handleToggleMobileMenu}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition lg:hidden',
                useLightOverlayContent
                  ? 'text-surface hover:bg-white/10'
                  : useDarkOverlayContent
                    ? 'text-ink hover:bg-black/5'
                    : 'text-ink hover:bg-canvas dark:text-surface dark:hover:bg-dark-bg-hover',
                isMobileMenuOpen
                  ? 'bg-primary-soft dark:bg-blue-900/30 text-primary'
                  : '',
              )}
              aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </button>
            <div className="mt-2 shrink-0">
              <Logo
                ariaLabel={t('homeAriaLabel')}
                ignoreDarkMode={useDarkOverlayContent}
                isInverted={useLightOverlayContent}
                onClick={handleLogoClick}
              />
            </div>
          </div>
          <div
            className={cn(
              'hidden flex-1 justify-center lg:flex',
              navContentVisibilityClassName,
            )}
          >
            <NavMenu
              isDropdownOpen={isDropdownOpen}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              handleMouseMove={handleMouseMove}
              isDarkOverlayStyle={useDarkOverlayContent}
              isOverlayStyle={useLightOverlayContent}
            />
          </div>
          <div
            className={cn(
              'ml-auto flex lg:ml-0 lg:flex-1 lg:justify-end',
              navContentVisibilityClassName,
            )}
          >
            <NavActions
              closeAccountDropdownSignal={isMobileMenuOpen}
              handleToggleSearch={handleToggleSearchWithClose}
              isDarkOverlayStyle={useDarkOverlayContent}
              isOverlayStyle={useLightOverlayContent}
              isSearchOpen={showSearchBar}
              onActionClick={handleCloseMobileMenu}
            />
          </div>
          <div ref={searchLayerRef}>
            <SearchBar
              showSearchBar={showSearchBar}
              setShowSearchBar={setShowSearchBar}
              setShowSearchSuggestion={setShowSearchSuggestion}
              onInputChange={handleSearchInputChange}
              inputText={inputText}
            />
            {showSearchBar && showSearchSuggestion && inputText !== '' && (
              <SearchSuggestion
                highlightedText={highlightedText}
                isLoading={isLoading}
              />
            )}
          </div>
        </PageWrapper>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          isShopOpen={isMobileShopOpen}
          onToggleShop={handleToggleMobileShop}
          onCloseMenu={handleCloseMobileMenu}
        />
      </nav>
      {isMobileMenuOpen && (
        <button
          type="button"
          onClick={handleCloseMobileMenu}
          className="fixed inset-0 top-22.5 z-30 bg-ink/20 lg:hidden"
          aria-label={t('closeMobileBackdrop')}
        />
      )}
    </header>
  );
}
