import type { ProductSortOption } from '@entities/product/model/sort';

import SortDropdown from '@shared/ui/SortDropdown';

type SortControlButtonProps = {
  sortOption: ProductSortOption;
  onSortChange: (nextSort: ProductSortOption) => void;
  disabled?: boolean;
};

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'relevance', label: '추천순' },
  { value: 'name_asc', label: '이름 오름차순' },
  { value: 'name_desc', label: '이름 내림차순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
];

export default function SortControlButton({
  sortOption,
  onSortChange,
  disabled = false,
}: SortControlButtonProps) {
  return (
    <SortDropdown<ProductSortOption>
      value={sortOption}
      options={SORT_OPTIONS}
      onChange={onSortChange}
      disabled={disabled}
      mobileSheetOnMobile
      mobileSheetTitle="정렬 기준"
    />
  );
}
