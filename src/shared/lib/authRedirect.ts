export const getLoginRedirectPath = (callbackUrl: string) =>
  `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
