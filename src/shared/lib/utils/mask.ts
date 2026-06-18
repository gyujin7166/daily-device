export const maskEmail = (email: string) => {
  if (!email) {
    return '';
  }

  const [id, domain] = email.split('@');

  if (!domain) {
    return email;
  }
  if (id.length <= 2) {
    return `${id[0]}*@${domain}`;
  }
  if (id.length <= 4) {
    return `${id.slice(0, 1)}**${id.slice(-1)}@${domain}`;
  }

  const visibleStart = id.slice(0, 2);
  const visibleEnd = id.slice(-2);
  const maskedMiddle = '*'.repeat(Math.max(1, id.length - 4));

  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
};

export const maskName = (name: string) => {
  if (!name) {
    return '';
  }
  if (name.length <= 1) {
    return '*';
  }
  if (name.length === 2) {
    return `${name[0]}*`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
};
