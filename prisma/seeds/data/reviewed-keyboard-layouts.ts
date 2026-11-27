import keyboardLayouts from './keyboard-layouts.json';

type KeyboardLayoutEntry = {
  name: string;
  layout: string;
  reviewed: boolean;
};

// Written by scripts/extractKeyboardLayouts.ts and checked by hand.
const layoutsBySlug: Record<string, KeyboardLayoutEntry> =
  keyboardLayouts.products;

/**
 * Returns the keyboard's layout option (a FilterOption name_en) only after a
 * person has reviewed the Gemini answer, so unchecked guesses never reach a
 * database.
 */
export const getReviewedKeyboardLayout = (slug: string) => {
  const entry = layoutsBySlug[slug];

  if (!entry?.reviewed || entry.layout === 'unknown') {
    return undefined;
  }

  return entry.layout;
};

export const getReviewedKeyboardLayoutSlugs = () =>
  Object.keys(layoutsBySlug).filter((slug) => getReviewedKeyboardLayout(slug));
