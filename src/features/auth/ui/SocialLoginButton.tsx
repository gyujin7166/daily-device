import type { ButtonHTMLAttributes } from 'react';

import { cva } from 'class-variance-authority';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type SocialProvider = 'google' | 'naver' | 'kakao';

type SocialLoginButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  provider: SocialProvider;
};

const buttonVariants = cva(
  'group relative flex h-12 w-full items-center justify-center rounded-md border px-4 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40',
  {
    variants: {
      provider: {
        google:
          'border-line dark:border-dark-border bg-surface dark:bg-dark-bg text-ink dark:text-surface hover:bg-canvas dark:hover:bg-dark-bg-hover',
        naver:
          'border-line dark:border-dark-border bg-surface dark:bg-dark-bg text-ink dark:text-surface hover:border-brand-naver hover:bg-brand-naver hover:text-surface dark:hover:border-brand-naver dark:hover:bg-brand-naver dark:hover:text-surface',
        kakao:
          'border-line dark:border-dark-border bg-surface dark:bg-dark-bg text-ink dark:text-surface hover:border-brand-kakao hover:bg-brand-kakao hover:text-ink dark:hover:border-brand-kakao dark:hover:bg-brand-kakao dark:hover:text-ink',
      },
    },
    defaultVariants: {
      provider: 'google',
    },
  },
);

const iconWrapperVariants = cva(
  'absolute left-4 flex h-5 w-5 items-center justify-center',
  {
    variants: {
      provider: {
        google: '',
        naver: 'text-brand-naver group-hover:text-surface',
        kakao:
          'text-ink dark:text-surface group-hover:text-ink dark:group-hover:text-ink',
      },
    },
    defaultVariants: {
      provider: 'google',
    },
  },
);

export default function SocialLoginButton({
  provider,
  children,
  className,
  ...props
}: SocialLoginButtonProps) {
  const t = useTranslations('Auth.social');

  return (
    <button
      type="button"
      className={cn(buttonVariants({ provider }), className ?? '')}
      {...props}
    >
      <span className={iconWrapperVariants({ provider })}>
        <ProviderIcon provider={provider} />
      </span>
      <span className="absolute left-1/2 -translate-x-1/2">
        {children ?? t(provider)}
      </span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
        className="text-brand-google-blue"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
        className="text-brand-google-green"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="currentColor"
        className="text-brand-google-yellow"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
        className="text-brand-google-red"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
      />
    </svg>
  );
}

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === 'google') {
    return <GoogleIcon />;
  }
  if (provider === 'naver') {
    return <NaverIcon />;
  }
  return <KakaoIcon />;
}
