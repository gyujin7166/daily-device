import type { ChangeEvent, FocusEvent } from 'react';

import { useFormatter, useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

import ReviewFormSection from './ReviewFormSection';

type ReviewFormTextFieldProps = {
  id: 'title' | 'content';
  label: string;
  value: string;
  error?: string;
  isBlurred: boolean;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function ReviewFormTextField({
  id,
  label,
  value,
  error,
  isBlurred,
  placeholder,
  maxLength,
  multiline = false,
  onChange,
  onBlur,
}: ReviewFormTextFieldProps) {
  const t = useTranslations('ReviewWrite.form');
  const format = useFormatter();
  const hasError = isBlurred && !!error;
  const fieldClassName = cn(
    'w-full appearance-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-disabled-text focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:placeholder:text-dark-muted dark:focus:border-primary',
    hasError && 'border-danger focus:border-danger focus:ring-danger/20',
  );

  return (
    <ReviewFormSection label={label} required>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          rows={6}
          className={cn('resize-none', fieldClassName)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={id}
          type="text"
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={fieldClassName}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        {hasError ? (
          <span className="text-xs font-semibold text-danger">{error}</span>
        ) : (
          <span />
        )}
        <span className="text-[11px] text-disabled-text dark:text-dark-muted">
          {t('characterCount', {
            count: format.number(value.length),
            max: format.number(maxLength),
          })}
        </span>
      </div>
    </ReviewFormSection>
  );
}
