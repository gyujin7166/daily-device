import { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@shared/lib/utils/style';

type MyPageScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

const MyPageScrollArea = forwardRef<HTMLDivElement, MyPageScrollAreaProps>(
  function MyPageScrollArea({ children, className }, ref) {
    return (
      <div ref={ref} className={cn('scrollbar-soft relative', className)}>
        {children}
      </div>
    );
  },
);

export default MyPageScrollArea;
