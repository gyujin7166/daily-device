import { useTranslations } from 'next-intl';

import MyPageEmptyStatePanel from '@widgets/my-page-empty/ui/MyPageEmptyStatePanel';

type MyAddressEmptyStateProps = {
  onCreate: () => void;
};

export default function MyAddressEmptyState({
  onCreate,
}: MyAddressEmptyStateProps) {
  const t = useTranslations('MyAddress.empty');

  return (
    <MyPageEmptyStatePanel
      title={t('title')}
      description={t('description')}
      iconVariant="address"
      action={
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-surface shadow-[0_14px_26px_-18px_rgba(37,99,235,0.75)] transition-colors hover:bg-primary-hover"
        >
          {t('action')}
        </button>
      }
    />
  );
}
