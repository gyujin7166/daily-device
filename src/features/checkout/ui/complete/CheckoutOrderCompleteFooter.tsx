import Link from 'next/link';

type CheckoutOrderCompleteFooterProps = {
  orderNumber: string;
  totalPrice: number;
};

const ACTION_LINK_BASE_CLASS =
  'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold';
const SECONDARY_ACTION_LINK_CLASS = `${ACTION_LINK_BASE_CLASS} border border-line bg-surface text-ink hover:bg-canvas dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface dark:hover:bg-dark-bg-hover`;
const PRIMARY_ACTION_LINK_CLASS = `${ACTION_LINK_BASE_CLASS} bg-primary text-surface hover:bg-primary-hover`;

export default function CheckoutOrderCompleteFooter({
  orderNumber,
  totalPrice,
}: CheckoutOrderCompleteFooterProps) {
  return (
    <>
      <div className="mt-8 flex items-center justify-between border-t border-line pt-6 dark:border-dark-border">
        <span className="text-base text-muted dark:text-dark-muted">
          총 결제금액
        </span>
        <span className="text-2xl font-bold text-ink dark:text-surface">
          {totalPrice.toLocaleString('ko-KR')}
          <span className="ml-1 text-base font-medium text-muted dark:text-dark-muted">
            원
          </span>
        </span>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/my/orders/${orderNumber}`}
          className={SECONDARY_ACTION_LINK_CLASS}
        >
          주문 상세 보기
        </Link>
        <Link href="/products" className={PRIMARY_ACTION_LINK_CLASS}>
          쇼핑 계속하기
        </Link>
      </div>
    </>
  );
}
