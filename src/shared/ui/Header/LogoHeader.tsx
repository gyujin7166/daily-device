import Image from 'next/image';
import Link from 'next/link';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

export default function LogoHeader() {
  return (
    <header className="z-40 text-center bg-surface dark:bg-dark-panel">
      <PageWrapper padding="comfortable">
        <div className="relative pt-4 pb-3 md:py-6 lg:py-8 leading-0">
          <Link
            href="/"
            aria-label="홈으로 이동"
            draggable={false}
            className="inline-flex h-10 select-none items-center justify-center"
          >
            <Image
              src="/logo/daily-device-logo-black.webp"
              alt="Daily Device"
              width={1550}
              height={296}
              className="h-8 w-auto select-none object-contain dark:invert sm:h-full"
              draggable={false}
              loading="eager"
            />
          </Link>
        </div>
      </PageWrapper>
    </header>
  );
}
