export const generateOrderNumber = (prefix?: string) => {
  const year = `${new Date().getFullYear()}`.slice(2);
  const month = `${new Date().getMonth() + 1}`.padStart(2, '0');
  const random = `${Math.floor(Math.random() * 10000000)}`.padStart(7, '0');
  const base = `${year}${month}${random}`;

  if (!prefix) {
    return base;
  }

  return `${prefix}-${base}`;
};
