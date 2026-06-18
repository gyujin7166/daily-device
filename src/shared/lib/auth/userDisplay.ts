type UserDisplaySource = {
  email?: string | null;
  name?: string | null;
};

export function getUserDisplayName(
  user: UserDisplaySource | null | undefined,
  fallback = '사용자',
) {
  const name = normalizeDisplayValue(user?.name);
  const email = normalizeDisplayValue(user?.email);

  if (name && name !== email && !name.includes('@')) {
    return name;
  }

  return fallback;
}

export function getUserInitial(
  user: UserDisplaySource | null | undefined,
  fallback = 'U',
) {
  const displayName = getUserDisplayName(user, '');
  const email = normalizeDisplayValue(user?.email);

  return (displayName || email || fallback).charAt(0).toUpperCase();
}

function normalizeDisplayValue(value: string | null | undefined) {
  return value?.trim() ?? '';
}
