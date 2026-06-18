import Image from 'next/image';
import Link from 'next/link';

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
} from '@tabler/icons-react';

import { NOT_IMPLEMENTED_MESSAGE } from '@shared/constants/feedback';
import { toast } from '@shared/lib/toast';

const NAV_LINKS = ['서비스 소개', '주요 기능', '채용 정보', '고객 지원'];
const POLICY_LINKS = [
  { label: '이용 약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '쿠키 정책', href: '/cookies' },
];
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
const FOOTER_LOGO_CLASS = 'h-7 w-auto select-none invert sm:h-8 lg:h-9';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const handleUnavailableMenuClick = () => {
    toast.info(NOT_IMPLEMENTED_MESSAGE);
  };

  return (
    <footer className="mt-auto bg-footer-bg">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xs bg-footer-bg px-6 pb-9 pt-9 text-surface sm:px-10 sm:pt-16 lg:px-14">
          <div className="flex flex-col gap-8">
            <div className="min-w-0">
              <Link
                href="/"
                aria-label="홈으로 이동"
                draggable={false}
                className="inline-block select-none leading-0"
              >
                <Image
                  src="/logo/daily-device-logo-black.webp"
                  alt="Daily Device"
                  width={1550}
                  height={296}
                  sizes="100vw"
                  className={FOOTER_LOGO_CLASS}
                  draggable={false}
                  loading="eager"
                />
              </Link>

              <div className="mt-8 flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <nav aria-label="Footer navigation">
                  <ul className="flex flex-wrap gap-x-7 gap-y-3 lg:flex-nowrap">
                    {NAV_LINKS.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={FOOTER_NAV_LINK_CLASS}
                          onClick={handleUnavailableMenuClick}
                        >
                          {item}
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
                © {currentYear} Ecommerce UI. All rights reserved.
              </p>
              <ul className="flex flex-wrap items-center gap-5">
                {POLICY_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={FOOTER_POLICY_LINK_CLASS}>
                      {label}
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
