import { formatDate } from '@shared/lib/utils/formatDate';

type MyOverviewLastLoginCardProps = {
  lastLoginAt: string | null;
  isAuthenticated: boolean;
};

export default function MyOverviewLastLoginCard({
  lastLoginAt,
  isAuthenticated,
}: MyOverviewLastLoginCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <h2 className="text-lg font-semibold text-ink dark:text-surface">
        최근 로그인 시각
      </h2>
      <p className="mt-3 rounded-xl border border-line bg-canvas px-4 py-4 text-sm text-ink dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface">
        {lastLoginAt
          ? formatDate(lastLoginAt)
          : isAuthenticated
            ? '첫 로그인 기록입니다.'
            : '-'}
      </p>
    </section>
  );
}
