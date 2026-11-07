'use client';

import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { HttpError } from '@shared/lib/errors/httpError';
import Button from '@shared/ui/Button/Button';

import { askProductAssistant } from '../api/productAssistant';

const MAX_PROMPT_LENGTH = 500;

export default function AiProductAssistant() {
  const t = useTranslations('AiProductAssistant');
  const id = useId();
  const isRequestingRef = useRef(false);
  const [prompt, setPrompt] = useState('');
  const { mutate, data, error, isPending } = useMutation({
    mutationFn: askProductAssistant,
    retry: false,
    gcTime: 0,
  });
  const question = prompt.trim();
  const isValidPrompt =
    question.length > 0 && question.length <= MAX_PROMPT_LENGTH;
  const isUnauthorized = error instanceof HttpError && error.status === 401;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidPrompt || isPending || isRequestingRef.current) {
      return;
    }

    isRequestingRef.current = true;
    mutate(question, {
      onSettled: () => {
        isRequestingRef.current = false;
      },
    });
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="mb-6 rounded-2xl border border-line bg-surface p-4 sm:p-6 dark:border-dark-border dark:bg-dark-panel"
    >
      <h2
        id={`${id}-title`}
        className="text-lg font-bold text-ink dark:text-surface"
      >
        {t('title')}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted dark:text-dark-muted">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label
          htmlFor={`${id}-prompt`}
          className="block text-sm font-semibold text-ink dark:text-surface"
        >
          {t('promptLabel')}
        </label>
        <textarea
          id={`${id}-prompt`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={MAX_PROMPT_LENGTH}
          rows={3}
          disabled={isPending}
          aria-describedby={`${id}-privacy`}
          placeholder={t('placeholder')}
          className="block w-full resize-y rounded-xl border border-line bg-info-soft px-3 py-3 text-sm leading-6 text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 dark:border-dark-border dark:bg-dark-panel-deep dark:text-surface dark:placeholder:text-dark-muted"
        />
        <p
          id={`${id}-privacy`}
          className="text-xs leading-5 text-muted dark:text-dark-muted"
        >
          {t('privacy')}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted dark:text-dark-muted">
            {t('characterCount', {
              count: prompt.length,
              max: MAX_PROMPT_LENGTH,
            })}
          </p>
          <Button
            type="submit"
            variant="secondary"
            disabled={!isValidPrompt || isPending}
            className="rounded-xl px-5 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-line disabled:bg-disabled-bg disabled:text-muted disabled:opacity-60 dark:disabled:border-dark-border dark:disabled:bg-dark-bg-hover dark:disabled:text-dark-muted"
          >
            {t('submit')}
          </Button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {isUnauthorized ? t('loginRequired') : t('error')}
        </p>
      ) : null}
      <div role="status" aria-live="polite" aria-atomic="true">
        {isPending ? (
          <p className="mt-4 text-sm text-muted dark:text-dark-muted">
            {t('loading')}
          </p>
        ) : null}
        {data ? (
          <div className="mt-5 rounded-xl bg-info-soft p-4 dark:bg-dark-panel-deep">
            <h3 className="text-sm font-semibold text-ink dark:text-surface">
              {t('answerTitle')}
            </h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink dark:text-surface">
              {data.answer}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
