import { cn } from '@shared/lib/utils/style';

type ProgressBarProps = {
  progress: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  animateDelayMs?: number;
  animateDurationMs?: number;
};

export default function ProgressBar({
  progress,
  className,
  trackClassName,
  barClassName,
  animateDelayMs = 0,
  animateDurationMs = 700,
}: ProgressBarProps) {
  return (
    <div className={cn(className ?? 'w-full')}>
      <div className="flex items-center">
        <div
          className={cn(
            'w-full bg-line h-2 rounded-full dark:bg-dark-bg-hover',
            trackClassName ?? '',
          )}
        >
          <div
            className={cn('bg-muted h-full rounded-full', barClassName ?? '')}
            style={{
              width: `${progress}%`,
              transitionProperty: 'width',
              transitionDuration: `${animateDurationMs}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${animateDelayMs}ms`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
