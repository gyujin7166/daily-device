import { defaultShouldDehydrateQuery, dehydrate } from '@tanstack/react-query';

import type { QueryClient } from '@tanstack/react-query';

/**
 * Next.js 서버 컴포넌트에서 prefetchQuery를 await하지 않는 패턴을 지원한다.
 * pending query도 함께 dehydrate해 클라이언트 Suspense가 같은 요청을 이어받게 한다.
 */
export const dehydrateWithPending = (queryClient: QueryClient) =>
  dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
  });
