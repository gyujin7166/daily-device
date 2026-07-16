import { IconDeviceMobile, IconMapPin, IconUser } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { UserAddress } from '@entities/address/model/types';

type AddressFormSummary = {
  name?: string;
  phone_number?: string;
  address_1?: string;
  address_2?: string;
};

type AddressSummarySectionProps = {
  summary: {
    isLoading: boolean;
    selectedAddress: UserAddress | null;
    formState: AddressFormSummary;
  };
};

type SummaryContentProps = {
  address1: string;
  address2?: string;
  recipientName: string;
  recipientPhone: string;
};

export default function AddressSummarySection({
  summary,
}: AddressSummarySectionProps) {
  const t = useTranslations('Checkout.shipping.summary');
  const { isLoading, selectedAddress, formState } = summary;

  if (isLoading) {
    return (
      <div className="mt-4 min-h-59 rounded-xl bg-canvas px-4 py-2 dark:bg-dark-bg-hover">
        <div className="animate-pulse divide-y divide-line dark:divide-dark-border">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-start gap-3 py-4">
              <span className="mt-1 h-9 w-9 rounded-full bg-line/80 dark:bg-dark-bg-hover/80" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 w-16 rounded-sm bg-line/80 dark:bg-dark-bg-hover/80" />
                <div className="h-4 w-4/5 rounded-sm bg-line/80 dark:bg-dark-bg-hover/80" />
                {index === 0 ? (
                  <div className="h-4 w-2/3 rounded-sm bg-line/70 dark:bg-dark-bg-hover/70" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedAddress) {
    return (
      <SummaryContent
        labels={{
          address: t('address'),
          recipient: t('recipient'),
          phone: t('phone'),
        }}
        address1={selectedAddress.address1}
        address2={selectedAddress.address2 ?? undefined}
        recipientName={selectedAddress.recipientName}
        recipientPhone={selectedAddress.recipientPhone}
      />
    );
  }

  if (formState.address_1) {
    return (
      <SummaryContent
        labels={{
          address: t('address'),
          recipient: t('recipient'),
          phone: t('phone'),
        }}
        address1={formState.address_1}
        address2={formState.address_2}
        recipientName={formState.name ?? ''}
        recipientPhone={formState.phone_number ?? ''}
      />
    );
  }

  return (
    <p className="mt-4 text-xs text-muted dark:text-dark-muted">{t('empty')}</p>
  );
}

function SummaryContent({
  labels,
  address1,
  address2,
  recipientName,
  recipientPhone,
}: SummaryContentProps & {
  labels: {
    address: string;
    recipient: string;
    phone: string;
  };
}) {
  return (
    <div className="mt-4 rounded-xl bg-canvas px-4 py-2 text-sm leading-6 dark:bg-dark-bg-hover">
      <div className="divide-y divide-line dark:divide-dark-border">
        <div className="flex items-start gap-3 py-4">
          <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-xs dark:bg-dark-panel dark:text-surface">
            <IconMapPin size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted dark:text-dark-muted">
              {labels.address}
            </p>
            <div className="mt-2 break-all text-ink dark:text-surface">
              {address1}
            </div>
            {address2 ? (
              <div className="break-all text-ink dark:text-surface">
                {address2}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-start gap-3 py-4">
          <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-xs dark:bg-dark-panel dark:text-surface">
            <IconUser size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted dark:text-dark-muted">
              {labels.recipient}
            </p>
            <div className="mt-2 font-semibold text-ink dark:text-surface">
              {recipientName}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 py-4">
          <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-xs dark:bg-dark-panel dark:text-surface">
            <IconDeviceMobile size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted dark:text-dark-muted">
              {labels.phone}
            </p>
            <div className="mt-2 break-all text-ink dark:text-surface">
              {recipientPhone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
