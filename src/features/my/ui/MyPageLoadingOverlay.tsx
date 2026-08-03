'use client';

import { usePathname } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import { getMyTabFromPathname } from '../model/myPageMenu';
import { useMyPageShellStore } from '../model/store/myPageShellStore';

type MyPageLoadingOverlayProps = {
  label: string;
  centerInViewport?: boolean;
  hideDuringTabTransition?: boolean;
  className?: string;
};

export default function MyPageLoadingOverlay({
  label,
  centerInViewport = false,
  hideDuringTabTransition = false,
  className,
}: MyPageLoadingOverlayProps) {
  const pathname = usePathname();
  const pendingTab = useMyPageShellStore((state) => state.pendingTab);
  const activeTab = getMyTabFromPathname(pathname);
  const isTabTransitionPending =
    pendingTab !== null && pendingTab !== activeTab;

  if (hideDuringTabTransition && isTabTransitionPending) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex justify-center',
        centerInViewport ? null : 'items-center',
        className,
      )}
    >
      <div
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface/95 shadow-xs dark:border-dark-border dark:bg-dark-panel/95',
          centerInViewport ? 'sticky top-[50vh] -translate-y-1/2' : null,
        )}
      >
        <Spinner size="sm" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
