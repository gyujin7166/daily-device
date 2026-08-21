import type { ButtonHTMLAttributes } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@shared/lib/utils/style';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  transition?: 'enabled' | 'disabled';
  size?: 'md' | 'lg';
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
          'justify-center text-on-primary bg-primary border-2 border-primary enabled:hover:bg-primary-hover enabled:hover:border-primary-hover',
      },
      size: {
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
