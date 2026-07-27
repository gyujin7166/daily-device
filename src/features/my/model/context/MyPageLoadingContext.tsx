import { createContext, useContext } from 'react';

type MyPageLoadingContextValue = {
  isTabTransitionPending: boolean;
};

export const MyPageLoadingContext = createContext<MyPageLoadingContextValue>({
  isTabTransitionPending: false,
});

export function useMyPageLoading() {
  return useContext(MyPageLoadingContext);
}
