import type { ReactElement } from 'react';

import { useTranslations } from 'next-intl';

type SearchSuggestionProps = {
  highlightedText: ReactElement[];
  isLoading: boolean;
};

export default function SearchSuggestion({
  highlightedText,
  isLoading,
}: SearchSuggestionProps) {
  const t = useTranslations('Search');
  const shouldRender = isLoading || highlightedText.length > 0;

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 top-23 z-50 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface shadow-lg dark:border-dark-border dark:bg-dark-panel">
          <ul className="max-h-[60vh] overflow-y-auto p-3 leading-6">
            {isLoading && highlightedText.length === 0 ? (
              <li className="rounded-xl px-3 py-3 text-sm text-muted dark:text-dark-muted">
                {t('checking')}
              </li>
            ) : (
              highlightedText
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
