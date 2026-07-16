'use client';

import type React from 'react';

import { IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

import { SUPPORT_LINKS } from '../../model/detail';

export default function ProductDetailSupportContent() {
  const t = useTranslations('ProductDetail.support');
  const commonFeedbackT = useTranslations('Common.feedback');
  const handleSupportLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    toast.info(commonFeedbackT('notImplemented'));
  };

  return (
    <>
      <p className="text-sm leading-[1.65] text-muted dark:text-dark-muted">
        {t('description')}
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
            <span>{t(link.labelKey)}</span>
            <IconChevronRight size={18} stroke={1.7} />
          </Link>
        ))}
      </div>
    </>
  );
}
