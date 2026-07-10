export const homeQueryKeys = {
  all: ['home'] as const,
  sections: (keys: string[] = [], locale?: string) =>
    [...homeQueryKeys.all, 'sections', keys.join(','), locale] as const,
};
