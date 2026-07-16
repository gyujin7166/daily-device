import type { ReactNode } from 'react';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { toast as baseToast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import type { ToastOptions } from 'react-toastify';

type AppToastType = 'default' | 'info' | 'success' | 'warning' | 'error';

type AppToastCardProps = {
  content: ReactNode;
  type: AppToastType;
  closeToast?: () => void;
};

type AppToastOptions = Omit<
  ToastOptions,
  'className' | 'progressClassName' | 'icon' | 'hideProgressBar'
>;

const TOAST_THEME: Record<
  AppToastType,
  {
    iconWrapperClassName: string;
    iconClassName: string;
    title: string;
    Icon: typeof IconInfoCircle;
  }
> = {
  default: {
    iconWrapperClassName: 'bg-primary-soft dark:bg-dark-bg-hover',
    iconClassName: 'text-primary dark:text-info',
    title: 'Notice',
    Icon: IconInfoCircle,
  },
  info: {
    iconWrapperClassName: 'bg-primary-soft dark:bg-dark-bg-hover',
    iconClassName: 'text-primary dark:text-info',
    title: 'Info',
    Icon: IconInfoCircle,
  },
  success: {
    iconWrapperClassName: 'bg-success-soft dark:bg-dark-bg-hover',
    iconClassName: 'text-success dark:text-brand-mint',
    title: 'Success',
    Icon: IconCircleCheckFilled,
  },
  warning: {
    iconWrapperClassName: 'bg-warning-soft dark:bg-dark-bg-hover',
    iconClassName: 'text-warning dark:text-warning',
    title: 'Warning',
    Icon: IconAlertTriangle,
  },
  error: {
    iconWrapperClassName: 'bg-danger/10 dark:bg-dark-bg-hover',
    iconClassName: 'text-danger dark:text-danger',
    title: 'Error',
    Icon: IconAlertCircle,
  },
};

function AppToastCard({ closeToast, content, type }: AppToastCardProps) {
  const t = useTranslations('Common');
  const { iconWrapperClassName, iconClassName, Icon } = TOAST_THEME[type];
  const resolvedContent =
    typeof content === 'string' || typeof content === 'number'
      ? String(content)
      : content;

  return (
    <div className="pointer-events-auto w-full overflow-hidden rounded-[18px] border border-line bg-surface px-6 py-5 shadow-lg shadow-primary/10 dark:border-dark-border dark:bg-dark-panel-deep dark:shadow-dark-elevated/60">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={twMerge(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            iconWrapperClassName,
          )}
        >
          <Icon size={18} stroke={2.2} className={iconClassName} />
        </span>
        <div className="min-w-0 flex-1 text-base font-medium leading-6 text-muted dark:text-dark-muted">
          {typeof resolvedContent === 'string' ? (
            <p className="wrap-break-word">{resolvedContent}</p>
          ) : (
            resolvedContent
          )}
        </div>
        <button
          type="button"
          onClick={closeToast}
          aria-label={t('toast.close')}
          className="-mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-line hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/35 dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
        >
          <IconX size={17} stroke={2.2} />
        </button>
      </div>
    </div>
  );
}

const BASE_OPTIONS: Pick<
  ToastOptions,
  'closeButton' | 'icon' | 'closeOnClick'
> = {
  closeButton: false,
  icon: false,
  closeOnClick: false,
};

const showToast = (
  type: AppToastType,
  content: ReactNode,
  options?: AppToastOptions,
) => {
  return baseToast(
    ({ closeToast }) => (
      <AppToastCard type={type} content={content} closeToast={closeToast} />
    ),
    {
      ...BASE_OPTIONS,
      ...options,
      type,
    },
  );
};

export const toast = {
  info: (content: ReactNode, options?: AppToastOptions) =>
    showToast('info', content, options),
  success: (content: ReactNode, options?: AppToastOptions) =>
    showToast('success', content, options),
  warning: (content: ReactNode, options?: AppToastOptions) =>
    showToast('warning', content, options),
  warn: (content: ReactNode, options?: AppToastOptions) =>
    showToast('warning', content, options),
  error: (content: ReactNode, options?: AppToastOptions) =>
    showToast('error', content, options),
  dismiss: baseToast.dismiss,
  clearWaitingQueue: baseToast.clearWaitingQueue,
  isActive: baseToast.isActive,
};
