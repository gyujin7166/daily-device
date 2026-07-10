export type LocaleSeed = 'ko' | 'en';

export type HeroTranslationSeed = {
  heroKey: string;
  locale: LocaleSeed;
  name: string;
  description?: string | null;
  detailed_description?: string | null;
};

export type HomeSectionTranslationSeed = {
  sectionKey: string;
  locale: LocaleSeed;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
};

export type HomeSectionItemTranslationSeed = {
  sectionKey: string;
  itemKey: string;
  locale: LocaleSeed;
  label?: string | null;
  title: string;
  description?: string | null;
  cta?: string | null;
  imageAlt?: string | null;
};

export const heroTranslations: HeroTranslationSeed[] = [
  {
    heroKey: 'workspace collection',
    locale: 'en',
    name: 'Workspace Collection',
    description: 'A desk setup built for focus',
    detailed_description:
      'A quiet, organized workspace shaped by a fictional productivity device collection.',
  },
  {
    heroKey: 'products',
    locale: 'en',
    name: 'Products',
    description:
      'Explore Daily Device essentials from mice and keyboards to headsets and accessories.',
    detailed_description: null,
  },
  {
    heroKey: 'discounts',
    locale: 'en',
    name: 'Sale',
    description:
      'Find discounted Daily Device products and build your setup at a better price.',
    detailed_description: null,
  },
];

export const homeSectionTranslations: HomeSectionTranslationSeed[] = [
  {
    sectionKey: 'featured-products',
    locale: 'en',
    eyebrow: 'Featured',
    title: 'Products that reshape daily work',
    subtitle:
      'Choose devices that fit the flow from focused work to calls and everyday movement.',
  },
  {
    sectionKey: 'category-carousel',
    locale: 'en',
    eyebrow: 'Categories',
    title: 'Product lines for every setup',
    subtitle:
      'Browse product groups at a glance and move quickly to the category you need.',
  },
];

export const homeSectionItemTranslations: HomeSectionItemTranslationSeed[] = [
  {
    sectionKey: 'featured-products',
    itemKey: 'aster-webcam-mini',
    locale: 'en',
    label: 'Webcam',
    title: 'Sharp video in a compact frame',
    description:
      'Aster Webcam Mini delivers clear video for meetings and online classes in a compact, simple form.',
    cta: 'View Aster Webcam Mini',
    imageAlt: 'Aster Webcam Mini',
  },
  {
    sectionKey: 'featured-products',
    itemKey: 'nook-keys-core',
    locale: 'en',
    label: 'Keyboard',
    title: 'A clean typing foundation',
    description:
      'Nook Keys Core keeps the desk calm while providing steady input for repeated work.',
    cta: 'View Nook Keys Core',
    imageAlt: 'Nook Keys Core',
  },
  {
    sectionKey: 'featured-products',
    itemKey: 'breeze-mouse-desk',
    locale: 'en',
    label: 'Mouse',
    title: 'A light mouse for tidy desks',
    description:
      'Breeze Mouse Desk is designed around smooth control and everyday comfort for clean workspaces.',
    cta: 'View Breeze Mouse Desk',
    imageAlt: 'Breeze Mouse Desk',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'mice',
    locale: 'en',
    title: 'Mice',
    imageAlt: 'Mice',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'cameras',
    locale: 'en',
    title: 'Cameras',
    imageAlt: 'Cameras',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'tablet-keyboards',
    locale: 'en',
    title: 'Tablet keyboards',
    imageAlt: 'Tablet keyboards',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'headsets',
    locale: 'en',
    title: 'Headsets',
    imageAlt: 'Headsets',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'security-cameras',
    locale: 'en',
    title: 'Security cameras',
    imageAlt: 'Security cameras',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'streaming-gear',
    locale: 'en',
    title: 'Streaming gear',
    imageAlt: 'Streaming gear',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'computer-speakers',
    locale: 'en',
    title: 'Computer speakers',
    imageAlt: 'Computer speakers',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'webcams',
    locale: 'en',
    title: 'Webcams',
    imageAlt: 'Webcams',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'smart-home',
    locale: 'en',
    title: 'Smart home',
    imageAlt: 'Smart home',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'phone-accessories',
    locale: 'en',
    title: 'Phone accessories',
    imageAlt: 'Phone accessories',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'bluetooth-speakers',
    locale: 'en',
    title: 'Bluetooth speakers',
    imageAlt: 'Bluetooth speakers',
  },
  {
    sectionKey: 'category-carousel',
    itemKey: 'keyboards',
    locale: 'en',
    title: 'Keyboards',
    imageAlt: 'Keyboards',
  },
];
