'use client';

import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import { useMyPageLoading } from '../model/context/MyPageLoadingContext';

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
  const { isTabTransitionPending } = useMyPageLoading();

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
