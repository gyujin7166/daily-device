'use client';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

type QueryErrorFallbackProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry: () => void;
  className?: string;
};

export default function QueryErrorFallback({
  title,
  description = '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
  retryLabel = '다시 시도',
  onRetry,
  className = '',
}: QueryErrorFallbackProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-5 shadow-xs dark:border-dark-border dark:bg-dark-panel sm:p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary dark:bg-dark-bg-hover dark:text-surface">
            <IconAlertCircle size={22} stroke={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink dark:text-surface">
              {title}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-muted dark:text-dark-muted">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-surface transition-colors hover:bg-ink/90 dark:bg-surface dark:text-ink dark:hover:bg-surface/90"
        >
          <IconRefresh size={16} />
          {retryLabel}
        </button>
      </div>
    </div>
  );
}
