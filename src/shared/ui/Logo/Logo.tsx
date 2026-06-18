import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@shared/lib/utils/style';

type LogoProps = {
  isInverted?: boolean;
  ignoreDarkMode?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export default function Logo({
  isInverted = false,
  ignoreDarkMode = false,
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="홈으로 이동"
      onClick={onClick}
      draggable={false}
      className="inline-block select-none leading-0"
    >
      <Image
        src="/logo/daily-device-logo-black.webp"
        alt="Daily Device"
        width={1550}
        height={296}
        sizes="100vw"
        className={cn(
          'h-7 w-auto select-none sm:h-8 lg:h-9',
          isInverted ? 'invert' : ignoreDarkMode ? '' : 'dark:invert',
        )}
        draggable={false}
        loading="eager"
      />
    </Link>
  );
}
