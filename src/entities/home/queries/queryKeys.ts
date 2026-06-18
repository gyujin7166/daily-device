export const homeQueryKeys = {
  all: ['home'] as const,
  sections: (keys: string[] = []) =>
    [...homeQueryKeys.all, 'sections', keys.join(',')] as const,
};
