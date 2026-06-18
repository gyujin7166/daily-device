import { formatDate } from '@shared/lib/utils/formatDate';

type MyOrderDetailSummaryFooterProps = {
  totalPrice: number;
  deliveryDate: string | null;
};

export default function MyOrderDetailSummaryFooter({
  totalPrice,
  deliveryDate,
}: MyOrderDetailSummaryFooterProps) {
  return (
    <footer className="border-t border-line px-5 py-4 sm:px-6 dark:border-dark-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-base font-semibold text-muted sm:text-lg dark:text-dark-muted">
          총 주문 금액
        </span>
        <span className="text-xl font-semibold leading-none tracking-[-0.02em] text-ink sm:text-2xl dark:text-surface">
          {totalPrice.toLocaleString('ko-KR')}{' '}
          <span className="text-sm sm:text-sm">원</span>
        </span>
      </div>
      {deliveryDate ? (
        <p className="mt-3 text-sm text-muted dark:text-dark-muted">
          배송일:{' '}
          <span className="font-medium">{formatDate(deliveryDate)}</span>
        </p>
      ) : null}
    </footer>
  );
}
