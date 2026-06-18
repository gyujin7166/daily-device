import { IconCreditCard } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutPaymentMethodCardProps = {
  method: CheckoutPaymentMethod;
  title: string;
  description: string;
  isSelected: boolean;
  disabled?: boolean;
  onSelectMethod: (method: CheckoutPaymentMethod) => void;
};

export default function CheckoutPaymentMethodCard({
  method,
  title,
  description,
  isSelected,
  disabled,
  onSelectMethod,
}: CheckoutPaymentMethodCardProps) {
  const cardClassName = cn(
    'w-full rounded-2xl border bg-surface px-5 py-4 text-left transition-shadow dark:bg-dark-bg-hover',
    isSelected
      ? 'border-2 border-primary ring-1 ring-primary/45 dark:border-primary dark:ring-primary/55'
      : 'border-line dark:border-dark-border hover:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line dark:hover:border-primary/60',
  );

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isSelected}
      onClick={() => onSelectMethod(method)}
      className={cardClassName}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary shadow-xs dark:bg-primary/20 dark:text-primary">
          <IconCreditCard size={18} />
        </span>
        <div className="flex-1">
          <p className="text-base font-semibold leading-6 text-ink dark:text-surface">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted dark:text-dark-muted">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
