'use client';
import type { ErrorInfo, ReactNode } from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

type ErrorBoundaryFallbackProps = {
  reset: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback:
    | ReactNode
    | ((fallbackProps: ErrorBoundaryFallbackProps) => ReactNode);
  onReset?: () => void;
};

export default function ErrorBoundary({
  children,
  fallback,
  onReset,
}: ErrorBoundaryProps) {
  const handleError = (error: unknown, errorInfo: ErrorInfo) => {
    console.error(error, errorInfo);
  };

  if (typeof fallback === 'function') {
    return (
      <ReactErrorBoundary
        onError={handleError}
        onReset={onReset}
        fallbackRender={({ resetErrorBoundary }) =>
          fallback({ reset: resetErrorBoundary })
        }
      >
        {children}
      </ReactErrorBoundary>
    );
  }

  return (
    <ReactErrorBoundary
      onError={handleError}
      onReset={onReset}
      fallback={fallback}
    >
      {children}
    </ReactErrorBoundary>
  );
}
