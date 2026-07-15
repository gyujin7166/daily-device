'use client';

import Image from 'next/image';

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import {
  DAILY_DEVICE_LOGO_SIZE,
  DAILY_DEVICE_LOGO_SRC,
  DAILY_DEVICE_SYMBOL_SIZE,
  DAILY_DEVICE_SYMBOL_SRC,
} from '@shared/constants/images';
import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

const NAV_LINK_KEYS = ['about', 'features', 'careers', 'support'] as const;
const POLICY_LINKS = [
  { key: 'terms', href: '/terms' },
  { key: 'privacy', href: '/privacy' },
  { key: 'cookies', href: '/cookies' },
] as const;
const SOCIAL_LINKS = [
  { label: 'X', icon: IconBrandX },
  { label: 'Instagram', icon: IconBrandInstagram },
  { label: 'Facebook', icon: IconBrandFacebook },
  { label: 'YouTube', icon: IconBrandYoutube },
];

const FOOTER_LINK_BASE_CLASS =
  'text-surface/90 transition-colors hover:text-surface';
const FOOTER_NAV_LINK_CLASS = `text-base font-medium ${FOOTER_LINK_BASE_CLASS}`;
const FOOTER_POLICY_LINK_CLASS = `text-sm ${FOOTER_LINK_BASE_CLASS}`;
const FOOTER_SOCIAL_BUTTON_CLASS =
  'inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-bg-hover text-surface transition-colors duration-200 hover:bg-primary';
const FOOTER_LOGO_CLASS =
  'hidden h-8 w-auto select-none invert sm:block lg:h-9';
const FOOTER_SYMBOL_CLASS = 'h-8 w-auto select-none invert sm:hidden';

export default function Footer() {
  const t = useTranslations('Footer');
  const commonFeedbackT = useTranslations('Common.feedback');
  const currentYear = new Date().getFullYear();
  const handleUnavailableMenuClick = () => {
    toast.info(commonFeedbackT('notImplemented'));
  };

  return (
    <footer className="mt-auto bg-footer-bg">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xs bg-footer-bg px-6 pb-9 pt-9 text-surface sm:px-10 sm:pt-16 lg:px-14">
          <div className="flex flex-col gap-8">
            <div className="min-w-0">
              <Link
                href="/"
                aria-label={t('homeAriaLabel')}
                draggable={false}
                className="inline-block select-none leading-0"
              >
                <Image
                  src={DAILY_DEVICE_SYMBOL_SRC}
                  alt="Daily Device"
                  width={DAILY_DEVICE_SYMBOL_SIZE.width}
                  height={DAILY_DEVICE_SYMBOL_SIZE.height}
                  sizes="52px"
                  className={FOOTER_SYMBOL_CLASS}
                  draggable={false}
                  loading="eager"
                />
                <Image
                  src={DAILY_DEVICE_LOGO_SRC}
                  alt="Daily Device"
                  width={DAILY_DEVICE_LOGO_SIZE.width}
                  height={DAILY_DEVICE_LOGO_SIZE.height}
                  sizes="100vw"
                  className={FOOTER_LOGO_CLASS}
                  draggable={false}
                  loading="eager"
                />
              </Link>

              <div className="mt-8 flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <nav aria-label={t('navigationLabel')}>
                  <ul className="flex flex-wrap gap-x-7 gap-y-3 lg:flex-nowrap">
                    {NAV_LINK_KEYS.map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          className={FOOTER_NAV_LINK_CLASS}
                          onClick={handleUnavailableMenuClick}
                        >
                          {t(`navigation.${key}`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="flex items-center gap-3 self-start lg:justify-end lg:self-auto">
                  {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      className={FOOTER_SOCIAL_BUTTON_CLASS}
                      onClick={handleUnavailableMenuClick}
                    >
                      <Icon size={18} stroke={1.8} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-surface/20 pt-5 sm:pt-6 lg:mt-12 lg:pt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-surface/90">
                © {currentYear} Daily Device. All rights reserved.
              </p>
              <ul className="flex flex-wrap items-center gap-5">
                {POLICY_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <Link href={href} className={FOOTER_POLICY_LINK_CLASS}>
                      {t(`legal.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
