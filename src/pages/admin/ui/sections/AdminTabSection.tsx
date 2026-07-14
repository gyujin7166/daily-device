import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

import type { AdminTab } from '../../model/types';

type AdminTabSectionProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
};

export default function AdminTabSection({
  activeTab,
  onTabChange,
}: AdminTabSectionProps) {
  const t = useTranslations('Admin.tabs');

  return (
    <nav className="flex flex-wrap gap-2 border-b border-line dark:border-dark-border">
      <TabButton
        active={activeTab === 'heroes'}
        onClick={() => onTabChange('heroes')}
      >
        {t('heroes')}
      </TabButton>
      <TabButton
        active={activeTab === 'home'}
        onClick={() => onTabChange('home')}
      >
        {t('home')}
      </TabButton>
      <TabButton
        active={activeTab === 'products'}
        onClick={() => onTabChange('products')}
      >
        {t('products')}
      </TabButton>
      <TabButton
        active={activeTab === 'reviews'}
        onClick={() => onTabChange('reviews')}
      >
        {t('reviews')}
      </TabButton>
    </nav>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 border-b-2 px-4 text-sm font-bold transition',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-ink dark:text-dark-muted dark:hover:text-surface',
      )}
    >
      {children}
    </button>
  );
}
