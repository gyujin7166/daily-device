import Image from 'next/image';
import Link from 'next/link';

import {
  DAILY_DEVICE_LOGO_SIZE,
  DAILY_DEVICE_LOGO_SRC,
  DAILY_DEVICE_SYMBOL_SIZE,
  DAILY_DEVICE_SYMBOL_SRC,
} from '@shared/constants/images';
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
        src={DAILY_DEVICE_SYMBOL_SRC}
        alt="Daily Device"
        width={DAILY_DEVICE_SYMBOL_SIZE.width}
        height={DAILY_DEVICE_SYMBOL_SIZE.height}
        sizes="52px"
        className={cn(
          'h-8 w-auto select-none sm:hidden',
          isInverted ? 'invert' : ignoreDarkMode ? '' : 'dark:invert',
        )}
        draggable={false}
        loading="eager"
      />
      <Image
        src={DAILY_DEVICE_LOGO_SRC}
        alt="Daily Device"
        width={DAILY_DEVICE_LOGO_SIZE.width}
        height={DAILY_DEVICE_LOGO_SIZE.height}
        sizes="100vw"
        className={cn(
          'hidden h-8 w-auto select-none sm:block lg:h-9',
          isInverted ? 'invert' : ignoreDarkMode ? '' : 'dark:invert',
        )}
        draggable={false}
        loading="eager"
      />
    </Link>
  );
}
