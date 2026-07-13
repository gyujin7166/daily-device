import { useLocale, useTranslations } from 'next-intl';

type SearchHeaderProps = {
  decodedQuery: string;
  totalItems: number;
  baseTotalItems?: number;
};

export default function SearchHeader({
  decodedQuery,
  totalItems,
  baseTotalItems,
}: SearchHeaderProps) {
  const locale = useLocale();
  const t = useTranslations('Search.results');
  if (totalItems === 0 && (baseTotalItems ?? 0) === 0) return null;
  const safeQuery = decodedQuery?.trim() || t('fallbackQuery');

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <h1 className="text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-3xl dark:text-surface">
          {t('title', { query: safeQuery })}
        </h1>
        <p className="text-base font-semibold leading-6 text-ink dark:text-surface">
          {t('total', {
            count: totalItems.toLocaleString(
              locale === 'ko' ? 'ko-KR' : 'en-US',
            ),
          })}
        </p>
      </div>
      <p className="mt-2 text-base text-muted dark:text-dark-muted">
        {t('description', { query: safeQuery })}
      </p>
    </div>
  );
}
