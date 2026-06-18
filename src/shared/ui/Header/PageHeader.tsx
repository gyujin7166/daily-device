import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type LogoHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  className = '',
}: LogoHeaderProps) {
  return (
    <div className={cn(className)}>
      <PageWrapper padding="comfortable">
        <div className="text-center pt-10 pb-3 lg:pt-20 lg:pb-16">
          <h1 className="mb-4 text-2xl font-bold leading-6.5 uppercase md:text-3xl md:leading-8 lg:text-4xl lg:leading-9.5">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-6 lg:text-lg lg:leading-6 text-muted dark:text-dark-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
      </PageWrapper>
    </div>
  );
}
