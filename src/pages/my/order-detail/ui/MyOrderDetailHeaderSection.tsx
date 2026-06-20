import Link from 'next/link';

import { IconChevronLeft, IconTrash, IconX } from '@tabler/icons-react';

import { MyPageMobileMenuButton } from '@features/my/ui';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';

type MyOrderDetailHeaderSectionProps = {
  canDeleteOrder: boolean;
  canCancelOrder: boolean;
  isDeletePending: boolean;
  isCancelPending: boolean;
  onDeleteOrder: () => void;
  onCancelOrder: () => void;
};

export default function MyOrderDetailHeaderSection({
  canDeleteOrder,
  canCancelOrder,
  isDeletePending,
  isCancelPending,
  onDeleteOrder,
  onCancelOrder,
}: MyOrderDetailHeaderSectionProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 items-start justify-between gap-3 md:block">
        <div className="border-l-4 border-primary pl-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ORDER
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-ink dark:text-surface">
            주문 상세
          </h1>
        </div>
        <MyPageMobileMenuButton />
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {canCancelOrder ? (
          <button
            type="button"
            onClick={onCancelOrder}
            disabled={isCancelPending || isDeletePending}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-muted transition-[background-color,border-color] hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:bg-dark-bg-hover"
          >
            <IconX size={16} className="shrink-0" />
            <span>주문 취소</span>
          </button>
        ) : null}
        {canDeleteOrder ? (
          <button
            type="button"
            onClick={onDeleteOrder}
            disabled={isDeletePending || isCancelPending}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-muted transition-[background-color,border-color] hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted dark:hover:bg-dark-bg-hover"
          >
            <IconTrash size={16} className="shrink-0" />
            <span>주문 삭제</span>
          </button>
        ) : null}
        <Link
          href={MY_TAB_PATHS.orders}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        >
          <IconChevronLeft size={16} />
          주문 목록
        </Link>
      </div>
    </header>
  );
}
