import Link from 'next/link';

import type { UserAddress } from '@entities/address/model/types';

type MyOverviewDefaultAddressCardProps = {
  defaultAddress: UserAddress | null;
  manageAddressHref: string;
};

export default function MyOverviewDefaultAddressCard({
  defaultAddress,
  manageAddressHref,
}: MyOverviewDefaultAddressCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-surface">
          기본 배송지
        </h2>
        <Link
          href={manageAddressHref}
          scroll={false}
          className="text-sm font-semibold text-primary hover:underline"
        >
          배송지 관리
        </Link>
      </div>
      {defaultAddress ? (
        <div className="rounded-xl border border-line bg-canvas px-4 py-4 text-sm dark:border-dark-border dark:bg-dark-bg-hover">
          <p className="font-semibold text-ink dark:text-surface">
            {defaultAddress.recipientName}
          </p>
          <p className="mt-1 text-muted dark:text-dark-muted">
            {defaultAddress.recipientPhone}
          </p>
          <p className="mt-2 text-ink dark:text-surface">
            {defaultAddress.address1}
            {defaultAddress.address2 ? ` ${defaultAddress.address2}` : ''}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-canvas px-4 py-4 text-sm text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
          기본 배송지가 설정되어 있지 않습니다.
        </p>
      )}
    </section>
  );
}
