import type { ReactNode } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@shared/lib/utils/style';

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section';
  size?: 'form' | 'content' | 'wide' | 'full';
  padding?: 'default' | 'compact' | 'comfortable' | 'wide' | 'none';
};

const pageWrapperVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      form: 'max-w-3xl',
      content: 'max-w-5xl',
      wide: 'max-w-7xl',
      full: 'max-w-none',
    },
    padding: {
      default: 'px-4 sm:px-6 lg:px-10',
      compact: 'px-4 sm:px-6',
      comfortable: 'px-6 md:px-10',
      wide: 'px-6 sm:px-8 lg:px-12',
      none: '',
    },
  },
  defaultVariants: {
    size: 'wide',
    padding: 'default',
  },
});

export default function PageWrapper({
  children,
  className,
  as: Component = 'div',
  size = 'wide',
  padding = 'default',
}: PageWrapperProps) {
  return (
    <Component
      className={cn(pageWrapperVariants({ size, padding }), className)}
    >
      {children}
    </Component>
  );
}
