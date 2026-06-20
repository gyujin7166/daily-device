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

const CATEGORY_LABELS: Record<string, string> = {
  mice: '마우스',
  keyboards: '키보드',
  'tablet-keyboards': '태블릿 키보드',
  headsets: '헤드셋',
  earphones: '이어폰',
  microphones: '마이크',
  webcams: '웹캠',
  cameras: '카메라',
  lighting: '조명',
  'streaming-gear': '스트리밍 장비',
  'tablet-accessories': '태블릿용',
  'phone-accessories': '스마트폰용',
  stands: '거치대',
  cables: '케이블',
  'bluetooth-speakers': 'Bluetooth® 스피커',
  'computer-speakers': '컴퓨터 스피커',
  'security-cameras': '보안 카메라',
  'smart-home': '스마트 홈',
};

const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: '관련도순' },
  { value: 'name_asc', label: '이름 오름차순' },
  { value: 'name_desc', label: '이름 내림차순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
];

const getCategoryLabel = (category: string) =>
  CATEGORY_LABELS[category] ?? category;

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
              모두 지우기
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
          <p className="whitespace-nowrap text-xs text-muted dark:text-dark-muted">
            표시 {visibleCount} / {totalCount}
          </p>
          <SortDropdown<SearchSortOption>
            value={sortOption}
            options={SORT_OPTIONS}
            onChange={onSortChange}
            menuWidthClassName="w-52.5"
            mobileSheetOnMobile
            mobileSheetTitle="정렬 기준"
          />
        </div>
      </div>
    </section>
  );
}
