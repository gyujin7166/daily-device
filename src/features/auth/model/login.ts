export type SocialProvider = 'google' | 'naver' | 'kakao';

export const SOCIAL_LOGIN_COMPLETED_MESSAGE = 'social-login:completed';

const DEFAULT_LOGIN_CALLBACK_URL = '/products';

export const buildPopupLoginUrl = (providerId: SocialProvider) =>
  `/login?popup=1&provider=${providerId}`;

export const getDemoLoginCallbackUrl = (callbackUrl?: string) =>
  callbackUrl || DEFAULT_LOGIN_CALLBACK_URL;
