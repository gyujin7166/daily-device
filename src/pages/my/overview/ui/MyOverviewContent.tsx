'use client';
import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { MyPageScrollArea, MyPageSectionHeader } from '@features/my/ui';

import { useSuspenseUserAddresses } from '@entities/address/queries/useUserAddresses';
import { useSuspenseOrdersPaged } from '@entities/order/queries/useOrdersPaged';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import {
  getUserDisplayName,
  getUserInitial,
} from '@shared/lib/auth/userDisplay';

import MyOverviewAccountCard from './MyOverviewAccountCard';
import MyOverviewDefaultAddressCard from './MyOverviewDefaultAddressCard';
import MyOverviewLastLoginCard from './MyOverviewLastLoginCard';
import MyOverviewRecentOrderCard from './MyOverviewRecentOrderCard';

import type { Session } from 'next-auth';

type MyOverviewContentProps = {
  session: Session;
};

export default function MyOverviewContent({ session }: MyOverviewContentProps) {
  const t = useTranslations('MyOverview');
  const commonT = useTranslations('Common');
  const { data: ordersPage } = useSuspenseOrdersPaged({
    mode: 'all',
    page: 1,
    limit: 1,
  });
  const { data: addresses = [] } = useSuspenseUserAddresses();
  const orders = ordersPage?.items ?? [];
  const avatarSrc = session.user?.image?.trim() ?? '';
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);
  const displayName = getUserDisplayName(session.user, commonT('userFallback'));
  const provider = session.user?.provider;
  const normalizedEmail = session.user?.email?.trim() || '';
  const isDemoAccount =
    provider === 'demo-login' || normalizedEmail === 'demo@daily-device.local';
  // 로그인 제공자별로 누락될 수 있는 프로필 정보를 사용자에게 보여줄 문구로 정규화한다.
  const profileEmail = isDemoAccount
    ? t('account.demoAccount')
    : provider === 'kakao' && !normalizedEmail
      ? t('account.kakaoEmailMissing')
      : normalizedEmail || t('account.emailMissing');
  const shouldShowAvatarImage = avatarSrc.length > 0 && !isAvatarLoadFailed;
  const profileInitial = getUserInitial(session.user);

  const defaultAddress = addresses.find((address) => address.isDefault) ?? null;
  const latestOrder = orders[0] ?? null;

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [avatarSrc]);

  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeader
        label="SUMMARY"
        title={t('page.title')}
        description={t('page.description', { name: displayName })}
      />

      <MyPageScrollArea className="grid auto-rows-max content-start gap-6">
        <MyOverviewAccountCard
          avatarSrc={avatarSrc}
          displayName={displayName}
          profileEmail={profileEmail}
          profileInitial={profileInitial}
          shouldShowAvatarImage={shouldShowAvatarImage}
          onAvatarError={() => setIsAvatarLoadFailed(true)}
        />
        <MyOverviewRecentOrderCard
          latestOrder={latestOrder}
          ordersHref={MY_TAB_PATHS.orders}
        />
        <MyOverviewDefaultAddressCard
          defaultAddress={defaultAddress}
          manageAddressHref={MY_TAB_PATHS.address}
        />
        <MyOverviewLastLoginCard
          lastLoginAt={session.user?.lastLoginAt ?? null}
          isAuthenticated
        />
      </MyPageScrollArea>
    </div>
  );
}
