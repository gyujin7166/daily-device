import type { ReactNode } from 'react';

import {
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

export const inputClass =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-hidden transition focus:border-primary dark:border-dark-border dark:bg-dark-panel';
export const textareaClass =
  'min-h-24 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-hidden transition focus:border-primary dark:border-dark-border dark:bg-dark-panel';
export const labelClass =
  'grid gap-1.5 text-sm font-medium text-ink dark:text-surface';

export function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 dark:border-dark-border dark:bg-dark-panel">
      <p className="text-sm font-semibold text-muted dark:text-dark-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {action}
    </div>
  );
}

export function TableHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-dark-border">
      <h2 className="font-bold">{title}</h2>
      <span className="text-sm font-semibold text-muted dark:text-dark-muted">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

export function ImageUrlList({
  items,
  emptyText = '-',
}: {
  items: Array<{
    id?: number | string;
    url: string | null | undefined;
    label?: string;
  }>;
  emptyText?: string;
}) {
  const imageItems = items.filter((item) => item.url?.trim());

  if (imageItems.length === 0) {
    return (
      <span className="text-xs text-muted dark:text-dark-muted">
        {emptyText}
      </span>
    );
  }

  return (
    <div className="grid max-w-full gap-1.5">
      {imageItems.map((item, index) => {
        const url = item.url?.trim() ?? '';

        return (
          <a
            key={item.id ?? `${url}-${index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            title={url}
            className="flex min-w-0 max-w-full items-center text-xs font-semibold text-primary underline-offset-2 hover:underline dark:text-blue-300"
          >
            {item.label ? (
              <span className="shrink-0">{item.label}:&nbsp;</span>
            ) : null}
            <span className="min-w-0 truncate">{url}</span>
          </a>
        );
      })}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        required={required}
        min={min}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={textareaClass}
        required={required}
      />
    </label>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  disabled = false,
  className,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
      >
        <IconPencil size={16} />
        수정
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-danger transition hover:border-danger disabled:opacity-60 dark:border-dark-border"
      >
        <IconTrash size={16} />
        삭제
      </button>
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotalPages }, (_, index) => index + 1)
    .filter(
      (pageNumber) =>
        pageNumber === 1 ||
        pageNumber === safeTotalPages ||
        Math.abs(pageNumber - page) <= 2,
    )
    .slice(0, 7);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3 dark:border-dark-border">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-50 dark:border-dark-border"
      >
        <IconChevronLeft size={16} />
        이전
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={cn(
            'h-9 min-w-9 rounded-md border px-3 text-sm font-bold',
            pageNumber === page
              ? 'border-primary bg-primary text-surface'
              : 'border-line bg-surface text-ink dark:border-dark-border dark:bg-dark-panel dark:text-surface',
          )}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
        disabled={page >= safeTotalPages}
        className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-50 dark:border-dark-border"
      >
        다음
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
