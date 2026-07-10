import { useTranslations } from 'next-intl';

import type { ProductSortOption } from '@entities/product/model/sort';

import SortDropdown from '@shared/ui/SortDropdown';

type SortControlButtonProps = {
  sortOption: ProductSortOption;
  onSortChange: (nextSort: ProductSortOption) => void;
  disabled?: boolean;
};

export default function SortControlButton({
  sortOption,
  onSortChange,
  disabled = false,
}: SortControlButtonProps) {
  const t = useTranslations('ProductFilter.sort');
  const sortOptions: { value: ProductSortOption; label: string }[] = [
    { value: 'relevance', label: t('relevance') },
    { value: 'name_asc', label: t('nameAsc') },
    { value: 'name_desc', label: t('nameDesc') },
    { value: 'price_asc', label: t('priceAsc') },
    { value: 'price_desc', label: t('priceDesc') },
  ];

  return (
    <SortDropdown<ProductSortOption>
      value={sortOption}
      options={sortOptions}
      onChange={onSortChange}
      disabled={disabled}
      mobileSheetOnMobile
      mobileSheetTitle={t('sheetTitle')}
    />
  );
}
