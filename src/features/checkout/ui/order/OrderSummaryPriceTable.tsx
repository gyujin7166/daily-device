type OrderSummaryPriceTableProps = {
  totalPrice: number;
};

export default function OrderSummaryPriceTable({
  totalPrice,
}: OrderSummaryPriceTableProps) {
  return (
    <div className="relative mb-2">
      <div className="w-full">
        <table className="w-full table-fixed border-separate border-spacing-y-2 text-ink dark:text-surface">
          <tbody className="text-sm leading-4 lg:text-base lg:leading-4.5 [&>tr>th]:font-medium [&>tr>td]:font-medium">
            <tr>
              <th className="text-start">상품금액</th>
              <td className="text-end">
                <span>{totalPrice.toLocaleString('ko-KR')} 원</span>
              </td>
            </tr>
            <tr>
              <th className="text-start">배송비</th>
              <td className="text-end">
                <span className="text-primary dark:text-surface">
                  무료 배송
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
              <th className="text-start">총 결제금액</th>
              <td className="text-end font-bold text-primary dark:text-surface">
                {totalPrice.toLocaleString('ko-KR')} 원
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
