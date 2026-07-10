'use client';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';

import { usePathname } from '@shared/lib/i18n/navigation';

type ProductRouteScrollTemplateProps = {
  children: ReactNode;
};

export default function ProductRouteScrollTemplate({
  children,
}: ProductRouteScrollTemplateProps) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [pathname]);

  return children;
}
