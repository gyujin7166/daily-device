import { IconArrowLeft, IconShoppingCartQuestion } from '@tabler/icons-react';

import Button from '@shared/ui/Button/Button';

type CheckoutPageEmptyStateProps = {
  onGoHome: () => void;
};

export default function CheckoutPageEmptyState({
  onGoHome,
}: CheckoutPageEmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-58px)] items-center justify-center md:min-h-[calc(100vh-88px)] lg:min-h-[calc(100vh-104px)]">
      <section className="-translate-y-14.5 text-center md:-translate-y-22 lg:-translate-y-26">
        <div className="grid gap-5 text-center">
          <div className="mx-auto flex h-35 w-35 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary">
            <IconShoppingCartQuestion size={80} />
          </div>
          <div className="grid gap-2">
            <h3 className="text-2xl font-medium text-ink dark:text-surface">
              장바구니가 비어있습니다
            </h3>
            <p className="text-base text-muted dark:text-dark-muted">
              아직 장바구니에 담긴 상품이 없습니다.
              <br />
              마음에 드는 상품을 찾아보세요.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="primary"
              size="md"
              transition="enabled"
              onClick={onGoHome}
              className="h-12 items-center gap-2.5 rounded-xl border-primary bg-primary px-10 text-surface hover:bg-primary-hover hover:text-surface dark:border-primary dark:bg-primary dark:text-surface dark:hover:bg-primary-hover"
            >
              <span>
                <IconArrowLeft size={20} />
              </span>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
