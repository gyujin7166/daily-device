import { SummaryItem } from '../shared/AdminControls';

import type { AdminSummaryItem } from '../../model/types';

type AdminSummarySectionProps = {
  items: AdminSummaryItem[];
};

export default function AdminSummarySection({
  items,
}: AdminSummarySectionProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <SummaryItem key={item.label} label={item.label} value={item.value} />
      ))}
    </section>
  );
}
