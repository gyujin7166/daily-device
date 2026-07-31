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
  areaClassName: string;
  labelPosition?: 'top' | 'bottom';
  imageClassName?: string;
};

export type HomeCategoryCarouselSlide = {
  gridAreaClassName: string;
  items: HomeCategoryCarouselItem[];
};

export const CATEGORY_CAROUSEL_LAYOUTS = [
  {
    gridAreaClassName:
      'lg:grid-cols-2 lg:grid-rows-[minmax(0,300px)_minmax(0,300px)_minmax(0,400px)]',
    areaClassNames: [
      'lg:col-start-1 lg:row-span-2',
      'lg:col-start-2 lg:row-start-1',
      'lg:col-start-2 lg:row-start-2',
      'lg:col-span-2 lg:row-start-3',
    ],
  },
  {
    gridAreaClassName:
      'lg:grid-cols-2 lg:grid-rows-[minmax(0,300px)_minmax(0,300px)_minmax(0,400px)]',
    areaClassNames: [
      'lg:col-start-1 lg:row-start-1',
      'lg:col-start-1 lg:row-start-2',
      'lg:col-start-2 lg:row-span-2',
      'lg:col-span-2 lg:row-start-3',
    ],
  },
  {
    gridAreaClassName:
      'lg:grid-cols-2 lg:grid-rows-[minmax(0,380px)_minmax(0,300px)_minmax(0,300px)]',
    areaClassNames: [
      'lg:col-span-2 lg:row-start-1',
      'lg:col-start-1 lg:row-span-2 lg:row-start-2',
      'lg:col-start-2 lg:row-start-2',
      'lg:col-start-2 lg:row-start-3',
    ],
  },
] as const;

export const HOME_CATEGORY_CAROUSEL_SLIDES: HomeCategoryCarouselSlide[] = [
  {
    gridAreaClassName: CATEGORY_CAROUSEL_LAYOUTS[0].gridAreaClassName,
    items: [
      {
        label: 'Mice & Keyboards',
        labelKey: 'fallbackItems.miceAndKeyboards',
        imageSrc: '/images/carousel/desktop_grey-mice-and-keyboards.png',
        imageAlt: 'desktop_grey-mice-and-keyboards',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[0].areaClassNames[0],
      },
      {
        label: 'Streaming',
        labelKey: 'fallbackItems.streaming',
        imageSrc: '/images/carousel/desktop_grey-streaming.png',
        imageAlt: 'desktop_grey-streaming',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[0].areaClassNames[1],
        labelPosition: 'top',
      },
      {
        label: 'iPad Keyboards',
        labelKey: 'fallbackItems.ipadKeyboards',
        imageSrc: '/images/carousel/desktop-grey-mobile-devices-4.png',
        imageAlt: 'desktop-grey-mobile-devices-4',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[0].areaClassNames[2],
      },
      {
        label: 'Headsets & Earbuds',
        labelKey: 'fallbackItems.headsetsAndEarbuds',
        imageSrc: '/images/carousel/desktop_grey-headsets.png',
        imageAlt: 'desktop_grey-headsets',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[0].areaClassNames[3],
        imageClassName: 'object-cover',
      },
    ],
  },
  {
    gridAreaClassName: CATEGORY_CAROUSEL_LAYOUTS[1].gridAreaClassName,
    items: [
      {
        label: 'Home Security',
        labelKey: 'fallbackItems.homeSecurity',
        imageSrc: '/images/carousel/desktop_home-security-cameras-gray.png',
        imageAlt: 'desktop_home-security-cameras-gray',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[1].areaClassNames[0],
      },
      {
        label: 'Presentation Remotes',
        labelKey: 'fallbackItems.presentationRemotes',
        imageSrc: '/images/carousel/desktop_grey-presentation-remotes.png',
        imageAlt: 'desktop_grey-presentation-remotes',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[1].areaClassNames[1],
        labelPosition: 'top',
      },
      {
        label: 'Speakers',
        labelKey: 'fallbackItems.speakers',
        imageSrc: '/images/carousel/desktop-speakers-z407-gray.png',
        imageAlt: 'desktop-speakers-z407-gray',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[1].areaClassNames[2],
      },
      {
        label: 'Video Conferencing',
        labelKey: 'fallbackItems.videoConferencing',
        imageSrc: '/images/carousel/desktop_grey-video-conferencing.png',
        imageAlt: 'desktop_grey-video-conferencing',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[1].areaClassNames[3],
        imageClassName: 'object-cover',
      },
    ],
  },
  {
    gridAreaClassName: CATEGORY_CAROUSEL_LAYOUTS[2].gridAreaClassName,
    items: [
      {
        label: 'Home Security',
        labelKey: 'fallbackItems.homeSecurity',
        imageSrc: '/images/carousel/desktop-daily-device-bkg.jpg',
        imageAlt: 'desktop-daily-device-bkg',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[2].areaClassNames[0],
      },
      {
        label: 'Presentation Remotes',
        labelKey: 'fallbackItems.presentationRemotes',
        imageSrc: '/images/carousel/desktop-jaybird-bkg.jpg',
        imageAlt: 'desktop-jaybird-bkg',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[2].areaClassNames[1],
        labelPosition: 'top',
      },
      {
        label: 'Speakers',
        labelKey: 'fallbackItems.speakers',
        imageSrc: '/images/carousel/desktop-ultimate-ears-bkg.jpg',
        imageAlt: 'desktop-ultimate-ears-bkg',
        areaClassName: CATEGORY_CAROUSEL_LAYOUTS[2].areaClassNames[2],
        imageClassName: 'object-cover',
      },
    ],
  },
];
