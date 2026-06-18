'use client';

import type React from 'react';

import Link from 'next/link';

import { IconChevronRight } from '@tabler/icons-react';

import { NOT_IMPLEMENTED_MESSAGE } from '@shared/constants/feedback';
import { toast } from '@shared/lib/toast';

import { SUPPORT_LINKS } from '../../model/detail';

export default function ProductDetailSupportContent() {
  const handleSupportLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    toast.info(NOT_IMPLEMENTED_MESSAGE);
  };

  return (
    <>
      <p className="text-sm leading-[1.65] text-muted dark:text-dark-muted">
        이 제품을 사용하는 데 필요한 모든 문서를 확인해보세요.
      </p>
      <div className="mt-4 space-y-2">
        {SUPPORT_LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            onClick={handleSupportLinkClick}
            aria-disabled
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-primary dark:text-surface dark:hover:text-primary"
          >
            <span>{link.text}</span>
            <IconChevronRight size={18} stroke={1.7} />
          </Link>
        ))}
      </div>
    </>
  );
}
