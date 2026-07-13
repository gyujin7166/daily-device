import { useEffect, useRef } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction, SubmitEvent } from 'react';


import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Transition } from 'react-transition-group';

import { useRouter } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';
import type { TransitionStyle } from '@shared/types/transition';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type SearchBarProps = {
  showSearchBar: boolean;
  setShowSearchBar: Dispatch<SetStateAction<boolean>>;
  setShowSearchSuggestion: Dispatch<SetStateAction<boolean>>;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputText: string;
};

export default function SearchBar({
  showSearchBar,
  setShowSearchBar,
  setShowSearchSuggestion,
  onInputChange,
  inputText,
}: SearchBarProps) {
  const t = useTranslations('Search');
  const router = useRouter();
  const nodeRef = useRef(null);
  const duration = 150;

  const transitionStyles: TransitionStyle = {
    entering: {
      opacity: 1,
    },
    entered: {
      opacity: 1,
    },
    exiting: {
      opacity: 0,
    },
    exited: {
      opacity: 0,
    },
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText.trim()) {
      const encodedQuery = encodeURIComponent(
        inputText.trim().toLowerCase().replace(/\s+/g, '-'),
      );
      router.push(`/search?query=${encodedQuery}`);
      setShowSearchSuggestion(false);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearchBar(false);
      }
    };

    if (showSearchBar) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [setShowSearchBar, showSearchBar]);

  return (
    <Transition
      nodeRef={nodeRef}
      in={showSearchBar}
      timeout={{ enter: duration, exit: 0 }}
      unmountOnExit
      className="overflow-hidden"
    >
      {(state) => (
        <form
          ref={nodeRef}
          onSubmit={handleSubmit}
          className={cn('fixed inset-x-0 top-0 z-50 h-22.5')}
          style={{
            transition:
              state === 'exiting' || state === 'exited'
                ? 'none'
                : `opacity ${duration}ms`,
            ...getTransitionStyle(transitionStyles, state),
          }}
        >
          <PageWrapper className="flex h-full items-center justify-center">
            <div className="flex max-w-3xl w-full items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 shadow-lg dark:border-dark-border dark:bg-dark-panel">
              <IconSearch
                className="text-muted dark:text-dark-muted"
                size={20}
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder={t('placeholder')}
                className="h-10 w-full bg-transparent text-base font-medium text-ink outline-hidden placeholder:text-muted dark:text-surface dark:placeholder:text-slate-400"
                onChange={onInputChange}
                value={inputText}
                autoFocus
              />
              <button
                type="button"
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary-soft dark:hover:bg-blue-900/40 hover:text-primary dark:text-dark-muted dark:hover:text-blue-300"
                onClick={() => setShowSearchBar((prev) => !prev)}
              >
                <IconX size={20} stroke={2} />
              </button>
            </div>
            <button type="submit" className="hidden">
              {t('submit')}
            </button>
          </PageWrapper>
        </form>
      )}
    </Transition>
  );
}
