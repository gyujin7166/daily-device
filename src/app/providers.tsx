'use client';
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { Slide, ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { HeroNavToneProvider } from '@shared/model/context/HeroNavToneContext';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={0}
        refetchOnWindowFocus
        refetchWhenOffline={false}
      >
        <HeroNavToneProvider>{children}</HeroNavToneProvider>
        <ToastContainer
          position="top-right"
          transition={Slide}
          autoClose={2600}
          pauseOnHover
          pauseOnFocusLoss
          newestOnTop
          draggable="touch"
          limit={4}
          icon={false}
          toastStyle={{
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            minHeight: 'auto',
            borderRadius: 18,
            overflow: 'hidden',
          }}
          className={(context) =>
            twMerge(
              context?.defaultClassName,
              'top-4! right-4! z-140! w-[min(92vw,420px)]! sm:right-6! md:right-8! lg:right-[max(40px,calc((100vw-1280px)/2+40px))]! max-sm:top-3! max-sm:left-3! max-sm:right-3! max-sm:w-auto!',
            )
          }
          toastClassName={(context) =>
            twMerge(
              context?.defaultClassName,
              'mb-3! min-h-0! w-full! border-0! bg-transparent! p-0! shadow-none! [&_.Toastify__toast-body]:m-0! [&_.Toastify__toast-body]:block! [&_.Toastify__toast-body]:p-0!',
            )
          }
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
