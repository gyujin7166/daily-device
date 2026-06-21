export type SocialProvider = 'google' | 'naver' | 'kakao';

export const SOCIAL_LOGIN_COMPLETED_MESSAGE = 'social-login:completed';
export const SOCIAL_LOGIN_ERROR_MESSAGE = 'social-login:error';

export type SocialLoginErrorMessage = {
  type: typeof SOCIAL_LOGIN_ERROR_MESSAGE;
  error: string;
};

export const getSocialLoginErrorMessage = (error: string) => {
  if (error === 'OAuthAccountNotLinked') {
    return '이미 다른 로그인 방식으로 가입된 이메일입니다. 처음 사용한 로그인 방식으로 다시 로그인해주세요.';
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
};

const DEFAULT_LOGIN_CALLBACK_URL = '/products';

export const buildPopupLoginUrl = (providerId: SocialProvider) =>
  `/login?popup=1&provider=${providerId}`;

export const getDemoLoginCallbackUrl = (callbackUrl?: string) =>
  callbackUrl || DEFAULT_LOGIN_CALLBACK_URL;
