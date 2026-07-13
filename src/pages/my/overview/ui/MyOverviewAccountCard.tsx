import Image from 'next/image';

import { useTranslations } from 'next-intl';

type MyOverviewAccountCardProps = {
  avatarSrc: string;
  displayName: string;
  profileEmail: string;
  profileInitial: string;
  shouldShowAvatarImage: boolean;
  onAvatarError: () => void;
};

export default function MyOverviewAccountCard({
  avatarSrc,
  displayName,
  profileEmail,
  profileInitial,
  shouldShowAvatarImage,
  onAvatarError,
}: MyOverviewAccountCardProps) {
  const t = useTranslations('MyOverview.account');

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div className="p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-canvas text-2xl font-semibold text-ink dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface">
            {shouldShowAvatarImage ? (
              <Image
                src={avatarSrc}
                alt={t('profileImageAlt', { name: displayName })}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                onError={onAvatarError}
              />
            ) : (
              <span>{profileInitial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t('title')}
            </p>
            <h2 className="mt-2 truncate text-2xl font-semibold text-ink dark:text-surface">
              {displayName}
            </h2>
            <p className="mt-1 break-all text-sm text-muted dark:text-dark-muted">
              {profileEmail}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
