import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

type NoSearchResultsProps = {
  searchTerm: string;
};

export default function NoSearchResults({ searchTerm }: NoSearchResultsProps) {
  const t = useTranslations('Search.results');

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
      <div className="mb-8">
        <IconSearch
          className="text-line dark:text-dark-muted"
          size={64}
          strokeWidth={1.5}
        />
      </div>
      <h2 className="mb-4 text-2xl font-bold">
        {t('emptyTitle', { query: searchTerm })}
      </h2>
      <p className="max-w-md text-center text-muted dark:text-dark-muted">
        {t('emptyDescription')}
      </p>
    </div>
  );
}
