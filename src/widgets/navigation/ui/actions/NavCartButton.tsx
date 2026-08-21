import { IconShoppingCart } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

import { NAV_ICON_BUTTON_SURFACE_CLASS } from '../../model/navActions';

type NavCartButtonProps = {
  cartItemCount: number;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onToggleCart: () => void;
};

export default function NavCartButton({
  cartItemCount,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onToggleCart,
}: NavCartButtonProps) {
  const t = useTranslations('Navigation.actions');

  return (
    <button
      className={cn(
        'relative',
        isOverlayStyle
          ? 'flex h-10 w-10 items-center justify-center rounded-xl text-surface transition hover:bg-white/10 sm:h-11 sm:w-11'
          : isDarkOverlayStyle
            ? 'flex h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-black/5 sm:h-11 sm:w-11'
            : NAV_ICON_BUTTON_SURFACE_CLASS,
      )}
      onClick={onToggleCart}
      aria-label={t('cart')}
      data-cart-trigger="true"
    >
      <IconShoppingCart />
      {cartItemCount > 0 ? (
        <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold leading-none text-on-primary">
          {cartItemCount}
        </span>
      ) : null}
    </button>
  );
}
