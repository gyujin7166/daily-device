import type { ButtonHTMLAttributes } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@shared/lib/utils/style';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'checkout';
  transition?: 'enabled' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
};

export default function Button({
  variant = 'primary',
  transition = 'disabled',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonVariants = cva(`flex cursor-pointer font-bold leading-4.5`, {
    variants: {
      variant: {
        primary:
          'justify-center text-ink dark:text-surface bg-surface dark:bg-dark-bg border-2 border-surface hover:bg-transparent hover:text-surface',
        secondary:
          'justify-center text-surface bg-primary border-2 border-primary enabled:hover:bg-primary-hover enabled:hover:border-primary-hover',
        checkout:
          'text-ink uppercase text-center rounded-full outline-2 -outline-offset-2 outline-brand-mint bg-brand-mint focus-visible:ring-4 focus-visible:ring-offset-[3px] focus-visible:ring-primary/50 enabled:hover:text-ink dark:text-surface dark:hover:text-surface disabled:opacity-70 hover:bg-brand-mint-hover',
      },
      size: {
        sm: 'px-7.5 py-3.5 text-sm',
        md: 'px-8 py-4 text-sm',
        lg: 'w-full py-3.5 text-sm',
      },
      transition: {
        enabled: 'transition duration-150',
        disabled: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      transition: 'disabled',
      size: 'md',
    },
  });

  return (
    <button
      className={cn(buttonVariants({ variant, transition, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
}
