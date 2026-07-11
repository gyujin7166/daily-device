import React, { useCallback, useState } from 'react';
import type { ReactElement } from 'react';

import { IconSearch } from '@tabler/icons-react';

import { Link } from '@shared/lib/i18n/navigation';
import { createSearchPattern } from '@shared/lib/utils/normalizeSearchText';

type SearchSuggestionItem = {
  id: number;
  name_en: string;
};

export default function useSearch() {
  const [inputText, setInputText] = useState('');
  const [highlightedText, setHighlightedText] = useState<ReactElement[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showSearchSuggestion, setShowSearchSuggestion] = useState(false);
  const handleToggleSearch = useCallback(() => {
    setShowSearchBar((prev) => {
      const nextShowSearchBar = !prev;

      if (nextShowSearchBar) {
        setInputText('');
      } else {
        setShowSearchSuggestion(false);
      }

      return nextShowSearchBar;
    });
  }, []);

  const createHighlightedElements = useCallback(
    (searchText: string, data: SearchSuggestionItem[]): ReactElement[] => {
      if (!searchText.trim()) {
        return [];
      }

      const pattern = createSearchPattern(searchText);
      if (!pattern) {
        return [];
      }

      const highlightRegex = new RegExp(`(${pattern})`, 'gi');
      const exactMatchRegex = new RegExp(`^(${pattern})$`, 'i');

      return data.map((item) => (
        <li key={item.id} className="list-none">
          <Link
            href={{
              pathname: '/search',
              query: {
                query: encodeURIComponent(
                  item.name_en.trim().toLowerCase().replace(/\s+/g, '-'),
                ),
              },
            }}
            onClick={() => {
              setShowSearchBar(false);
              setShowSearchSuggestion(false);
            }}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-primary-soft dark:hover:bg-blue-900/40 hover:text-primary dark:text-surface dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          >
            <IconSearch
              width={17}
              height={17}
              strokeWidth={2.25}
              className="text-muted transition-colors group-hover:text-primary dark:text-dark-muted dark:group-hover:text-blue-300"
            />
            <span>
              {item.name_en
                .split(highlightRegex)
                .map((split: string, index: number) =>
                  exactMatchRegex.test(split) ? (
                    <mark
                      key={index}
                      className="rounded-sm bg-primary-soft px-0.5 text-primary dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {split}
                    </mark>
                  ) : (
                    split
                  ),
                )}
            </span>
          </Link>
        </li>
      ));
    },
    [],
  );

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchText = event.target.value;
      setInputText(searchText);

      if (searchText.trim()) {
        setShowSearchSuggestion(true);
      } else {
        setShowSearchSuggestion(false);
      }
    },
    [],
  );

  const updateHighlightedText = useCallback(
    (searchText: string, data: SearchSuggestionItem[]) => {
      const highlighted = createHighlightedElements(searchText, data);
      setHighlightedText(highlighted);
    },
    [createHighlightedElements],
  );

  return {
    inputText,
    setInputText,
    highlightedText,
    setHighlightedText,
    showSearchBar,
    setShowSearchBar,
    showSearchSuggestion,
    setShowSearchSuggestion,
    handleToggleSearch,
    handleSearchInputChange,
    updateHighlightedText,
  };
}
