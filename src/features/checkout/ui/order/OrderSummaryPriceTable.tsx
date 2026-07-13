import { useFormatter, useTranslations } from 'next-intl';

type OrderSummaryPriceTableProps = {
  totalPrice: number;
};

export default function OrderSummaryPriceTable({
  totalPrice,
}: OrderSummaryPriceTableProps) {
  const format = useFormatter();
  const t = useTranslations('Checkout.summary');

  return (
    <div className="relative mb-2">
      <div className="w-full">
        <table className="w-full table-fixed border-separate border-spacing-y-2 text-ink dark:text-surface">
          <tbody className="text-sm leading-4 lg:text-base lg:leading-4.5 [&>tr>th]:font-medium [&>tr>td]:font-medium">
            <tr>
              <th className="text-start">{t('productAmount')}</th>
              <td className="text-end">
                <span>
                  {t('currency', { amount: format.number(totalPrice) })}
                </span>
              </td>
            </tr>
            <tr>
              <th className="text-start">{t('shippingFee')}</th>
              <td className="text-end">
                <span className="text-primary dark:text-surface">
                  {t('freeShipping')}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot className="lg:text-lg leading-5">
            <tr>
              <td className="text-end" colSpan={2}>
                <hr className="my-2 border-t-2 border-line dark:border-dark-border" />
              </td>
            </tr>
            <tr>
              <th className="text-start">{t('total')}</th>
              <td className="text-end font-bold text-primary dark:text-surface">
                {t('currency', { amount: format.number(totalPrice) })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
