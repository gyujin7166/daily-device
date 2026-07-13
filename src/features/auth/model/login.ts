export type SocialProvider = 'google' | 'naver' | 'kakao';

export const SOCIAL_LOGIN_COMPLETED_MESSAGE = 'social-login:completed';
export const SOCIAL_LOGIN_ERROR_MESSAGE = 'social-login:error';

export type SocialLoginErrorMessage = {
  type: typeof SOCIAL_LOGIN_ERROR_MESSAGE;
  error: string;
};

export const getSocialLoginErrorMessage = (
  error: string,
  messages?: {
    accountNotLinked: string;
    defaultError: string;
  },
) => {
  if (error === 'OAuthAccountNotLinked') {
    return (
      messages?.accountNotLinked ??
      'This email is already linked to another login method. Try the login method you used first.'
    );
  }

  return messages?.defaultError ?? 'Login failed. Please try again later.';
};

const DEFAULT_LOGIN_CALLBACK_URL = '/products';

export const buildPopupLoginUrl = (providerId: SocialProvider) =>
  `/login?popup=1&provider=${providerId}`;

export const getDemoLoginCallbackUrl = (callbackUrl?: string) =>
  callbackUrl || DEFAULT_LOGIN_CALLBACK_URL;
