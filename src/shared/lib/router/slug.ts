export const decodeSlugToText = (value?: string | null): string =>
  value ? decodeURIComponent(value).replace(/-/g, ' ') : '';
