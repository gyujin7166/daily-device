import {
  IconDiscountCheckFilled,
  IconHome,
  IconMapPin,
  IconPencil,
  IconPhoneCall,
  IconTrash,
} from '@tabler/icons-react';
import { useFormatter, useTranslations } from 'next-intl';

import { formatAddressPhone } from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';

import { cn } from '@shared/lib/utils/style';

type MyAddressCardProps = {
  address: UserAddress;
  isProcessing: boolean;
  isAnimatedDefault: boolean;
  onEdit: (address: UserAddress) => void;
  onDelete: (addressId: number) => void;
  onSetDefault: (address: UserAddress) => void;
};

const useAddressUpdatedAtText = (updatedAt?: string) => {
  const t = useTranslations('MyAddress.card');
  const format = useFormatter();

  if (!updatedAt) {
    return t('updatedUnknown');
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return t('updatedUnknown');
  }

  return t('updatedAt', {
    date: format.dateTime(date, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }),
  });
};

const getAddressIcon = (address: UserAddress) => {
  return address.isDefault ? IconHome : IconMapPin;
};

export default function MyAddressCard({
  address,
  isProcessing,
  isAnimatedDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: MyAddressCardProps) {
  const t = useTranslations('MyAddress.card');
  const AddressIcon = getAddressIcon(address);
  const updatedAtText = useAddressUpdatedAtText(address.updatedAt);
  const addressIconClassName = address.isDefault
    ? 'bg-primary text-on-primary'
    : 'border border-line bg-info-soft text-primary dark:border-dark-border dark:bg-dark-panel-hover dark:text-primary';
  const actionIconClassName = address.isDefault
    ? 'text-primary'
    : 'text-muted dark:text-dark-muted';

  return (
    <article
      className={cn(
        'rounded-2xl border bg-surface px-5 py-5 shadow-xs transition-[background-color,border-color,opacity,box-shadow,transform] duration-200 dark:bg-dark-panel sm:px-6',
        address.isDefault
          ? 'border-[3px] border-primary/70'
          : 'border-line dark:border-dark-border',
        isAnimatedDefault
          ? 'motion-safe:animate-address-promote motion-safe:will-change-transform'
          : '',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
              addressIconClassName,
              isAnimatedDefault ? 'motion-safe:animate-address-icon-pop' : '',
            )}
          >
            <AddressIcon size={24} stroke={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink dark:text-surface">
                {address.recipientName}
              </h2>
              {address.isDefault ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-primary',
                    isAnimatedDefault
                      ? 'motion-safe:animate-address-badge-pop'
                      : '',
                  )}
                >
                  <IconDiscountCheckFilled size={12} />
                  {t('defaultBadge')}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted dark:text-dark-muted">
              {updatedAtText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted dark:hover:bg-dark-panel-hover dark:hover:text-surface"
            onClick={() => onEdit(address)}
            disabled={isProcessing}
            aria-label={t('edit')}
          >
            <IconPencil size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted dark:hover:bg-dark-panel-hover dark:hover:text-surface"
            onClick={() => onDelete(address.id)}
            disabled={isProcessing}
            aria-label={t('delete')}
          >
            <IconTrash size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 border-t border-line pt-4 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)] dark:border-dark-border">
        <div className="flex items-start gap-3">
          <IconMapPin
            size={22}
            className={cn('mt-1 shrink-0', actionIconClassName)}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted/80 dark:text-dark-muted">
              {t('address')}
            </p>
            <p className="mt-1 keep-all text-sm leading-6 text-ink dark:text-surface">
              {address.address1}
            </p>
            {address.address2 ? (
              <p className="keep-all text-sm leading-6 text-ink dark:text-surface">
                {address.address2}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <IconPhoneCall
            size={22}
            className={cn('mt-1 shrink-0', actionIconClassName)}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted/80 dark:text-dark-muted">
              {t('phone')}
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.01em] text-ink dark:text-surface">
              {formatAddressPhone(address.recipientPhone)}
            </p>
          </div>
        </div>
      </div>

      {!address.isDefault ? (
        <button
          type="button"
          className="mt-5 inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onSetDefault(address)}
          disabled={isProcessing}
        >
          {isProcessing ? t('setting') : t('setDefault')}
        </button>
      ) : (
        <p className="mt-5 text-sm font-semibold text-primary">
          {t('defaultAddress')}
        </p>
      )}
    </article>
  );
}
