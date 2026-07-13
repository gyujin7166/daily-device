import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

type NoSearchResultsProps = {
  searchTerm: string;
};

export default function NoSearchResults({ searchTerm }: NoSearchResultsProps) {
  const t = useTranslations('Search.results');

  return (
    <div className="flex flex-col items-center justify-center py-12 translate-y-1/2">
      <div className="mb-8">
        <IconSearch
          className="text-line dark:text-dark-muted"
          size={64}
          strokeWidth={1.5}
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">
        {t('emptyTitle', { query: searchTerm })}
      </h2>
      <p className="text-muted text-center max-w-md mb-8 dark:text-dark-muted">
        {t('emptyDescription')}
      </p>
    </div>
  );
}
