'use client';
import { useEffect, useState } from 'react';

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

const LAST_LOGIN_STORAGE_KEY = 'my:last-login-at';

type MyOverviewContentProps = {
  session: Session;
};

export default function MyOverviewContent({ session }: MyOverviewContentProps) {
  const { data: ordersPage } = useSuspenseOrdersPaged({
    mode: 'all',
    page: 1,
    limit: 1,
  });
  const { data: addresses = [] } = useSuspenseUserAddresses();
  const orders = ordersPage?.items ?? [];
  const avatarSrc = session.user?.image?.trim() ?? '';
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const displayName = getUserDisplayName(session.user);
  const provider = session.user?.provider;
  const normalizedEmail = session.user?.email?.trim() || '';
  const isDemoAccount =
    provider === 'demo-login' || normalizedEmail === 'demo@daily-device.local';
  // 로그인 제공자별로 누락될 수 있는 프로필 정보를 사용자에게 보여줄 문구로 정규화한다.
  const profileEmail = isDemoAccount
    ? '데모 계정'
    : provider === 'kakao' && !normalizedEmail
      ? '카카오 로그인 계정 (이메일 미제공)'
      : normalizedEmail || '이메일 정보 없음';
  const shouldShowAvatarImage = avatarSrc.length > 0 && !isAvatarLoadFailed;
  const profileInitial = getUserInitial(session.user);

  const defaultAddress = addresses.find((address) => address.isDefault) ?? null;
  const latestOrder = orders[0] ?? null;

  useEffect(() => {
    // 현재 로그인 시각은 다음 방문 때 "최근 로그인"으로 보여주기 위해 브라우저에 저장한다.
    const previousLoginAt = window.localStorage.getItem(LAST_LOGIN_STORAGE_KEY);
    setLastLoginAt(previousLoginAt);
    window.localStorage.setItem(
      LAST_LOGIN_STORAGE_KEY,
      new Date().toISOString(),
    );
  }, []);

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [avatarSrc]);

  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeader
        label="SUMMARY"
        title="요약"
        description={`${displayName}님, 최근 활동과 주문 상태를 확인하세요.`}
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
        <MyOverviewLastLoginCard lastLoginAt={lastLoginAt} isAuthenticated />
      </MyPageScrollArea>
    </div>
  );
}
