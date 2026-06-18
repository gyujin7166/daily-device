type CheckoutSectionProps = {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export default function CheckoutSection({
  title,
  children,
  action,
}: CheckoutSectionProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs lg:p-6 dark:border-dark-border dark:bg-dark-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold uppercase leading-5.5 text-ink lg:text-xl lg:leading-6 dark:text-surface">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
