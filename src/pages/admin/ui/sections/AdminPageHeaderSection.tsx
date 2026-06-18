import { IconMoon, IconRefresh, IconSun } from '@tabler/icons-react';

import { useThemeMode } from '@shared/hooks/useThemeMode';
import { cn } from '@shared/lib/utils/style';

type AdminPageHeaderSectionProps = {
  onRefresh: () => void;
};

export default function AdminPageHeaderSection({
  onRefresh,
}: AdminPageHeaderSectionProps) {
  const { mounted, theme, toggleTheme } = useThemeMode();
  const isDarkMode = mounted && theme === 'dark';

  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 dark:border-dark-border md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold">콘텐츠 관리</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="테마 전환"
          aria-pressed={isDarkMode}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface text-ink transition hover:border-primary hover:text-primary dark:border-dark-border dark:bg-dark-panel dark:text-surface',
            !mounted && 'text-muted dark:text-dark-muted',
          )}
        >
          <IconMoon className="dark:hidden" size={18} />
          <IconSun className="hidden dark:block" size={18} />
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold transition hover:border-primary hover:text-primary dark:border-dark-border dark:bg-dark-panel"
        >
          <IconRefresh size={18} />
          새로고침
        </button>
      </div>
    </header>
  );
}
