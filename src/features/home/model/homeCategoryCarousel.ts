type HomeCategoryCarouselLabelKey =
  | 'fallbackItems.miceAndKeyboards'
  | 'fallbackItems.streaming'
  | 'fallbackItems.ipadKeyboards'
  | 'fallbackItems.headsetsAndEarbuds'
  | 'fallbackItems.homeSecurity'
  | 'fallbackItems.presentationRemotes'
  | 'fallbackItems.speakers'
  | 'fallbackItems.videoConferencing';

export type HomeCategoryCarouselItem = {
  label: string;
  labelKey?: HomeCategoryCarouselLabelKey;
  cta?: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  labelPosition?: 'top' | 'bottom';
  imageClassName?: string;
};
