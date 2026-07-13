import { IconShoppingBag, IconX } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useCartContext } from '@entities/cart/model/context/CartContext';

export default function CartHeader() {
  const t = useTranslations('Cart');
  const { closeCart, userCartItems, localCartItems } = useCartContext();
  const { status } = useSession();
  const items = status === 'authenticated' ? userCartItems : localCartItems;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="border-b border-line bg-surface dark:border-dark-border dark:bg-dark-bg">
      <div className="flex min-h-19.5 w-full items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/20 dark:text-primary">
            <IconShoppingBag size={19} stroke={1.6} />
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg leading-none font-semibold tracking-tight text-ink dark:text-surface">
              {t('title')}
            </h2>
            {totalQuantity > 0 && (
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-sm font-semibold text-surface">
                {totalQuantity}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
          onClick={closeCart}
          aria-label={t('close')}
        >
          <IconX size={25} stroke={1.8} />
        </button>
      </div>
    </div>
  );
}
