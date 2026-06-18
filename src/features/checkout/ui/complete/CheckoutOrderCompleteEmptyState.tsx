import Link from 'next/link';

export default function CheckoutOrderCompleteEmptyState() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <p className="text-sm text-muted dark:text-dark-muted">
        주문 정보를 찾을 수 없습니다.
      </p>
      <div className="mt-4">
        <Link
          href="/my/orders"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-canvas dark:border-dark-border dark:text-surface dark:hover:bg-dark-bg-hover"
        >
          주문 목록으로 이동
        </Link>
      </div>
    </section>
  );
}
