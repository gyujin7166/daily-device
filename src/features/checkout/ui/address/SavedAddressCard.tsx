import type { MouseEvent } from 'react';

import { IconCheck, IconDiscountCheckFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { UserAddress } from '@entities/address/model/types';

import { cn } from '@shared/lib/utils/style';

type SavedAddressCardProps = {
  state: {
    item: UserAddress;
    isSelected: boolean;
    isRecentBadgeTarget: boolean;
    isAddressActionBusy: boolean;
  };
  actions: {
    onSelectSavedAddress: (savedAddress: UserAddress) => void;
    onEditSavedAddress: (savedAddress: UserAddress) => void;
    onDeleteAddress: (
      event: MouseEvent<HTMLButtonElement>,
      addressId: number,
    ) => void;
  };
};

export default function SavedAddressCard({
  state,
  actions,
}: SavedAddressCardProps) {
  const t = useTranslations('Checkout.shipping.savedAddress');
  const { item, isSelected, isRecentBadgeTarget, isAddressActionBusy } = state;
  const { onSelectSavedAddress, onEditSavedAddress, onDeleteAddress } = actions;

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEditSavedAddress(item);
  };

  return (
    <div
      className={cn(
        'relative rounded-3xl border p-6 shadow-xs transition sm:rounded-2xl sm:p-5',
        isSelected
          ? 'border-2 border-primary bg-primary-soft dark:border-primary dark:bg-primary/20'
          : 'border-line bg-surface dark:border-dark-border dark:bg-dark-bg-hover',
      )}
    >
      <button
        type="button"
        aria-label={t('selectAria', { name: item.recipientName })}
        aria-pressed={isSelected}
        onClick={() => onSelectSavedAddress(item)}
        className="absolute inset-0 rounded-3xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:rounded-2xl dark:focus-visible:ring-offset-dark-bg"
      />

      {isSelected ? (
        <span className="absolute -right-3 -top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-primary text-surface shadow-xs sm:-right-2 sm:-top-2 sm:h-7 sm:w-7 sm:border">
          <IconCheck stroke={3} className="h-5 w-5 sm:h-4 sm:w-4" />
        </span>
      ) : null}

      <div className="pointer-events-none relative min-w-0">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xl font-semibold leading-7 text-ink sm:text-lg sm:leading-6 dark:text-surface">
            {item.recipientName}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {item.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary">
                <IconDiscountCheckFilled size={14} />
                {t('defaultBadge')}
              </span>
            ) : null}
            {!item.isDefault && isRecentBadgeTarget ? (
              <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary-soft px-2.5 py-1 text-xs font-semibold leading-4 text-primary sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs dark:bg-primary/20 dark:text-primary">
                {t('recentBadge')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-2.5 text-lg leading-8 text-ink/85 sm:text-sm dark:text-surface/85">
          <p>{item.recipientPhone}</p>
        </div>

        <div className="mt-1.5 space-y-1 text-lg leading-8 text-ink/85 sm:text-sm dark:text-surface/85">
          <p className="break-all">{item.address1}</p>
          {item.address2 ? <p className="break-all">{item.address2}</p> : null}
        </div>

        <div className="pointer-events-auto relative z-10 mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleEdit}
            className="text-base font-semibold leading-6 text-muted transition hover:text-primary disabled:cursor-not-allowed disabled:text-disabled-text dark:text-dark-muted sm:text-sm sm:text-primary dark:hover:text-primary dark:sm:text-primary"
            disabled={isAddressActionBusy}
          >
            {t('edit')}
          </button>
          <button
            type="button"
            onClick={(event) => onDeleteAddress(event, item.id)}
            className="text-base font-semibold leading-6 text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:text-disabled-text dark:text-dark-muted sm:text-sm dark:hover:text-surface"
            disabled={isAddressActionBusy}
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
