import { cn } from '@shared/lib/utils/style';

type HomeSectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  subtitleClassName?: string;
};

export default function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  subtitleClassName = '',
}: HomeSectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
          {title}
        </h2>
      </div>
      <p
        className={cn(
          'max-w-md text-sm leading-6 text-muted dark:text-dark-muted',
          subtitleClassName,
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}
