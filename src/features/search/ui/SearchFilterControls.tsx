import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';
import SortDropdown from '@shared/ui/SortDropdown';

import type { SearchSortOption } from '../model/types';

type SearchFilterControlsProps = {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
  sortOption: SearchSortOption;
  onSortChange: (nextSort: SearchSortOption) => void;
  visibleCount: number;
  totalCount: number;
};

const CATEGORY_LABEL_KEYS = {
  mice: 'mice',
  keyboards: 'keyboards',
  'tablet-keyboards': 'tabletKeyboards',
  headsets: 'headsets',
  earphones: 'earphones',
  microphones: 'microphones',
  webcams: 'webcams',
  cameras: 'cameras',
  lighting: 'lighting',
  'streaming-gear': 'streamingGear',
  'tablet-accessories': 'tabletAccessories',
  'phone-accessories': 'phoneAccessories',
  stands: 'stands',
  cables: 'cables',
  'bluetooth-speakers': 'bluetoothSpeakers',
  'computer-speakers': 'computerSpeakers',
  'security-cameras': 'securityCameras',
  'smart-home': 'smartHome',
} as const;

export default function SearchFilterControls({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  sortOption,
  onSortChange,
  visibleCount,
  totalCount,
}: SearchFilterControlsProps) {
  const t = useTranslations('Search.filters');
  const sortOptions: { value: SearchSortOption; label: string }[] = [
    { value: 'relevance', label: t('sort.relevance') },
    { value: 'name_asc', label: t('sort.nameAsc') },
    { value: 'name_desc', label: t('sort.nameDesc') },
    { value: 'price_asc', label: t('sort.priceAsc') },
    { value: 'price_desc', label: t('sort.priceDesc') },
  ];
  const getCategoryLabel = (category: string) => {
    const key =
      CATEGORY_LABEL_KEYS[category as keyof typeof CATEGORY_LABEL_KEYS];

    return key ? t(`categories.${key}`) : category;
  };

  if (categories.length === 0 && visibleCount === 0 && totalCount === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5 dark:border-dark-border dark:bg-dark-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onToggleCategory(category)}
                className={cn(
                  'inline-flex h-8 items-center rounded-full px-3 text-sm font-semibold transition-colors',
                  isSelected
                    ? 'bg-primary text-surface'
                    : 'bg-info-soft text-muted hover:text-ink dark:bg-dark-bg-hover dark:text-dark-muted dark:hover:text-surface',
                )}
              >
                {getCategoryLabel(category)}
              </button>
            );
          })}
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={onClearCategories}
              className="inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold text-muted transition-colors hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
            >
              {t('clearAll')}
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
          <p className="whitespace-nowrap text-xs text-muted dark:text-dark-muted">
            {t('visibleCount', { visible: visibleCount, total: totalCount })}
          </p>
          <SortDropdown<SearchSortOption>
            value={sortOption}
            options={sortOptions}
            onChange={onSortChange}
            menuWidthClassName="w-52.5"
            mobileSheetOnMobile
            mobileSheetTitle={t('sortSheetTitle')}
          />
        </div>
      </div>
    </section>
  );
}
