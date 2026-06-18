import { useEffect, useState } from 'react';

import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

type FilterToggleButtonProps = {
  visibleFilter: boolean;
  onToggleFilter: () => void;
};

export default function FilterToggleButton({
  visibleFilter,
  onToggleFilter,
}: FilterToggleButtonProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const label = isHydrated
    ? visibleFilter
      ? '필터 숨기기'
      : '필터 표시'
    : '필터';

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover dark:hover:text-primary-soft"
      onClick={onToggleFilter}
    >
      <IconAdjustmentsHorizontal size={16} stroke={2} />
      <span>{label}</span>
    </button>
  );
}
