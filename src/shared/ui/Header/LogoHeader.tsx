import Image from 'next/image';
import Link from 'next/link';

import {
  DAILY_DEVICE_LOGO_SIZE,
  DAILY_DEVICE_LOGO_SRC,
  DAILY_DEVICE_SYMBOL_SIZE,
  DAILY_DEVICE_SYMBOL_SRC,
} from '@shared/constants/images';
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
              src={DAILY_DEVICE_SYMBOL_SRC}
              alt="Daily Device"
              width={DAILY_DEVICE_SYMBOL_SIZE.width}
              height={DAILY_DEVICE_SYMBOL_SIZE.height}
              sizes="52px"
              className="h-8 w-auto select-none object-contain dark:invert sm:hidden"
              draggable={false}
              loading="eager"
            />
            <Image
              src={DAILY_DEVICE_LOGO_SRC}
              alt="Daily Device"
              width={DAILY_DEVICE_LOGO_SIZE.width}
              height={DAILY_DEVICE_LOGO_SIZE.height}
              sizes="100vw"
              className="hidden h-full w-auto select-none object-contain dark:invert sm:block"
              draggable={false}
              loading="eager"
            />
          </Link>
        </div>
      </PageWrapper>
    </header>
  );
}
