import Image from 'next/image';

import { IconUser } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type NavAccountAvatarProps = {
  avatarSrc: string;
  shouldShowAvatarImage: boolean;
  size?: 'sm' | 'md';
  onAvatarError: () => void;
};

export default function NavAccountAvatar({
  avatarSrc,
  shouldShowAvatarImage,
  size = 'sm',
  onAvatarError,
}: NavAccountAvatarProps) {
  const t = useTranslations('Navigation.account');
  const dimension = size === 'md' ? 48 : 40;
  const wrapperClassName = size === 'md' ? 'h-12 w-12' : 'h-9 w-9';

  if (shouldShowAvatarImage) {
    return (
      <div
        className={cn(
          wrapperClassName,
          'overflow-hidden rounded-full border border-line bg-surface dark:border-dark-bg-hover dark:bg-dark-panel-deep',
        )}
      >
        <Image
          src={avatarSrc}
          alt={t('profileImageAlt')}
          width={dimension}
          height={dimension}
          className="h-full w-full object-cover"
          onError={onAvatarError}
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        'flex',
        wrapperClassName,
        'items-center justify-center rounded-full border border-line bg-surface dark:border-dark-bg-hover dark:bg-dark-panel-deep',
      )}
    >
      <IconUser className="h-5 w-5 text-muted dark:text-dark-muted" />
    </span>
  );
}
