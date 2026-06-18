import { formatDate } from '@shared/lib/utils/formatDate';

type CheckoutOrderCompleteHeaderProps = {
  orderNumber: string;
  createdAt: string;
};

export default function CheckoutOrderCompleteHeader({
  orderNumber,
  createdAt,
}: CheckoutOrderCompleteHeaderProps) {
  return (
    <div className="px-8 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-ink dark:text-surface">
            주문 완료
          </h3>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            주문번호{' '}
            <span className="font-semibold text-ink dark:text-surface">
              #{orderNumber}
            </span>{' '}
            · {formatDate(createdAt)}
          </p>
          <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-sm leading-6 text-primary dark:bg-blue-950/35 dark:text-blue-100">
            포트폴리오 데모 주문입니다. 실제 비용 청구나 상품 배송은 발생하지
            않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
