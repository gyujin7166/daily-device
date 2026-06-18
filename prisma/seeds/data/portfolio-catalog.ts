import { filterCatalog } from './filter-catalog';

import type { ProductLine } from '@prisma/client';

type PortfolioProductCategorySeed = {
  name_en: string;
  name_ko: string;
  slug: string;
  parentSlug: string | null;
  displayOrder: number;
  image_url?: string | null;
  hero_image_url?: string | null;
  isVisible?: boolean;
};

type PortfolioColorSeed = {
  name: PortfolioColorName;
  hex: string;
};

type PortfolioProductImageSeed = {
  image_url: string;
  order: number;
  isMain: boolean;
  promptKey: string;
  colorName?: string | null;
};

type PortfolioProductDetailSeed = {
  titleId: number;
  title_middle: string | null;
  title_sub: string | null;
  specification: string[] | null;
  note: string | null;
};

const portfolioProductCategoryNames = [
  'mice',
  'keyboards',
  'tablet-keyboards',
  'headsets',
  'earphones',
  'microphones',
  'webcams',
  'cameras',
  'lighting',
  'streaming-gear',
  'tablet-accessories',
  'phone-accessories',
  'stands',
  'cables',
  'bluetooth-speakers',
  'computer-speakers',
  'security-cameras',
  'smart-home',
] as const;

type PortfolioProductCategoryName =
  (typeof portfolioProductCategoryNames)[number];

type PortfolioProductSeed = {
  name_en: string;
  name_ko: string;
  slug: string;
  categoryName: PortfolioProductCategoryName;
  search_keyword: string;
  description: string;
  detailed_description: string;
  note: string | null;
  price: number;
  discountRate?: number;
  productLine: ProductLine;
  colors: PortfolioColorName[];
  filterOptions: string[];
  images: PortfolioProductImageSeed[];
  details: PortfolioProductDetailSeed[];
};

export const portfolioProductCategories: PortfolioProductCategorySeed[] = [
  {
    name_en: 'mice-keyboards',
    name_ko: '마우스 & 키보드',
    slug: 'mice-keyboards',
    parentSlug: null,
    displayOrder: 1,
    image_url: 'https://i.ibb.co/9ggbXmQ/shop-products-mice-keyboards.webp',
  },
  {
    name_en: 'audio-microphones',
    name_ko: '오디오 & 마이크',
    slug: 'audio-microphones',
    parentSlug: null,
    displayOrder: 2,
    image_url: 'https://i.ibb.co/CQmYF5C/shop-products-headsets-webcams.webp',
  },
  {
    name_en: 'cameras-streaming',
    name_ko: '카메라 & 스트리밍',
    slug: 'cameras-streaming',
    parentSlug: null,
    displayOrder: 3,
    image_url: 'https://i.ibb.co/M2rb097/shop-products-streaming.webp',
  },
  {
    name_en: 'accessories',
    name_ko: '액세서리',
    slug: 'accessories',
    parentSlug: null,
    displayOrder: 4,
    image_url: 'https://i.ibb.co/zFByTqQ/shop-products-accessories.webp',
  },
  {
    name_en: 'speakers-smart-home',
    name_ko: '스피커 & 스마트 홈',
    slug: 'speakers-smart-home',
    parentSlug: null,
    displayOrder: 5,
    image_url:
      'https://i.ibb.co/M7D1BdB/shop-products-speakers-smart-home.webp',
  },
  {
    name_en: 'mice',
    name_ko: '마우스',
    slug: 'mice',
    parentSlug: 'mice-keyboards',
    displayOrder: 1,
  },
  {
    name_en: 'keyboards',
    name_ko: '키보드',
    slug: 'keyboards',
    parentSlug: 'mice-keyboards',
    displayOrder: 2,
  },
  {
    name_en: 'tablet-keyboards',
    name_ko: '태블릿 키보드',
    slug: 'tablet-keyboards',
    parentSlug: 'mice-keyboards',
    displayOrder: 3,
  },
  {
    name_en: 'headsets',
    name_ko: '헤드셋',
    slug: 'headsets',
    parentSlug: 'audio-microphones',
    displayOrder: 1,
  },
  {
    name_en: 'earphones',
    name_ko: '이어폰',
    slug: 'earphones',
    parentSlug: 'audio-microphones',
    displayOrder: 2,
  },
  {
    name_en: 'microphones',
    name_ko: '마이크',
    slug: 'microphones',
    parentSlug: 'audio-microphones',
    displayOrder: 3,
  },
  {
    name_en: 'webcams',
    name_ko: '웹캠',
    slug: 'webcams',
    parentSlug: 'cameras-streaming',
    displayOrder: 1,
  },
  {
    name_en: 'cameras',
    name_ko: '카메라',
    slug: 'cameras',
    parentSlug: 'cameras-streaming',
    displayOrder: 2,
  },
  {
    name_en: 'lighting',
    name_ko: '조명',
    slug: 'lighting',
    parentSlug: 'cameras-streaming',
    displayOrder: 3,
  },
  {
    name_en: 'streaming-gear',
    name_ko: '스트리밍 장비',
    slug: 'streaming-gear',
    parentSlug: 'cameras-streaming',
    displayOrder: 4,
  },
  {
    name_en: 'tablet-accessories',
    name_ko: '태블릿 액세서리',
    slug: 'tablet-accessories',
    parentSlug: 'accessories',
    displayOrder: 1,
  },
  {
    name_en: 'phone-accessories',
    name_ko: '스마트폰 액세서리',
    slug: 'phone-accessories',
    parentSlug: 'accessories',
    displayOrder: 2,
  },
  {
    name_en: 'stands',
    name_ko: '거치대',
    slug: 'stands',
    parentSlug: 'accessories',
    displayOrder: 3,
  },
  {
    name_en: 'cables',
    name_ko: '케이블',
    slug: 'cables',
    parentSlug: 'accessories',
    displayOrder: 4,
  },
  {
    name_en: 'bluetooth-speakers',
    name_ko: 'Bluetooth® 스피커',
    slug: 'bluetooth-speakers',
    parentSlug: 'speakers-smart-home',
    displayOrder: 1,
  },
  {
    name_en: 'computer-speakers',
    name_ko: '컴퓨터 스피커',
    slug: 'computer-speakers',
    parentSlug: 'speakers-smart-home',
    displayOrder: 2,
  },
  {
    name_en: 'security-cameras',
    name_ko: '보안 카메라',
    slug: 'security-cameras',
    parentSlug: 'speakers-smart-home',
    displayOrder: 3,
  },
  {
    name_en: 'smart-home',
    name_ko: '스마트 홈',
    slug: 'smart-home',
    parentSlug: 'speakers-smart-home',
    displayOrder: 4,
  },
];

const portfolioColorNames = [
  '오프화이트',
  '그래파이트',
  '페일그레이',
  '로즈핑크',
  '블루',
  '레드',
  '샌드베이지',
  '라일락',
  '세이지그린',
] as const;

type PortfolioColorName = (typeof portfolioColorNames)[number];

export const portfolioColors: PortfolioColorSeed[] = [
  { name: '오프화이트', hex: '#f2f3f4' },
  { name: '그래파이트', hex: '#3c4144' },
  { name: '페일그레이', hex: '#d7dce0' },
  { name: '로즈핑크', hex: '#e7c7bd' },
  { name: '블루', hex: '#2f5fbd' },
  { name: '레드', hex: '#d85f55' },
  { name: '샌드베이지', hex: '#d9c9ad' },
  { name: '라일락', hex: '#c6b7e8' },
  { name: '세이지그린', hex: '#9fb7a5' },
];

const DEFAULT_SUPPLEMENTAL_PRODUCTS_PER_CATEGORY = 15;

const supplementalProductNamePrefixes = [
  'Aster',
  'Nova',
  'Lumen',
  'Civic',
  'Mellow',
  'Orbit',
  'Slate',
  'Breeze',
  'Nook',
  'Harbor',
  'Pixel',
  'Frame',
  'Kindle',
  'Studio',
  'Beacon',
] as const;

const supplementalProductNameVariants = [
  { en: 'Mini', ko: '미니' },
  { en: 'Air', ko: '에어' },
  { en: 'Slim', ko: '슬림' },
  { en: 'Studio', ko: '스튜디오' },
  { en: 'Pro', ko: '프로' },
  { en: 'Plus', ko: '플러스' },
  { en: 'Go', ko: '고' },
  { en: 'Desk', ko: '데스크' },
  { en: 'Core', ko: '코어' },
  { en: 'Max', ko: '맥스' },
  { en: 'Flow', ko: '플로우' },
  { en: 'Lite', ko: '라이트' },
  { en: 'One', ko: '원' },
  { en: 'Touch', ko: '터치' },
  { en: 'Flex', ko: '플렉스' },
] as const;

const supplementalProductNameNouns: Partial<
  Record<PortfolioProductCategoryName, { en: string; ko: string }>
> = {
  mice: { en: 'Mouse', ko: '마우스' },
  keyboards: { en: 'Keys', ko: '키보드' },
  'tablet-keyboards': { en: 'Tablet Keys', ko: '태블릿 키보드' },
  headsets: { en: 'Headset', ko: '헤드셋' },
  earphones: { en: 'Earbuds', ko: '이어버드' },
  microphones: { en: 'Mic', ko: '마이크' },
  webcams: { en: 'Webcam', ko: '웹캠' },
  cameras: { en: 'Cam', ko: '카메라' },
  lighting: { en: 'Light', ko: '라이트' },
  'streaming-gear': { en: 'Stream Gear', ko: '스트리밍 기어' },
  'tablet-accessories': { en: 'Tablet Kit', ko: '태블릿 키트' },
  'phone-accessories': { en: 'Phone Kit', ko: '폰 키트' },
  stands: { en: 'Stand', ko: '스탠드' },
  cables: { en: 'Cable', ko: '케이블' },
  'bluetooth-speakers': { en: 'Speaker', ko: '스피커' },
  'computer-speakers': { en: 'Desk Speaker', ko: '데스크 스피커' },
  'security-cameras': { en: 'Security Cam', ko: '보안 카메라' },
  'smart-home': { en: 'Home Kit', ko: '홈 키트' },
};

const toProductSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const supplementalProductLines: ProductLine[] = [
  'EVERYDAY_LINE',
  'BUSINESS_SERIES',
  'PERFORMANCE_SERIES',
];

const supplementalProductLineFilterSlugs: Record<ProductLine, string> = {
  EVERYDAY_LINE: 'everyday-line',
  BUSINESS_SERIES: 'business-series',
  PERFORMANCE_SERIES: 'performance-series',
};

const supplementalDiscountRates = [0, 0, 10, 0, 15, 0, 20, 0, 0, 5] as const;

type SupplementalProductCopyPreset = {
  description: (categoryName: string) => string;
  detailedDescription: (categoryName: string) => string;
};

const supplementalProductCopyPresets: SupplementalProductCopyPreset[] = [
  {
    description: (categoryName) =>
      `${categoryName} 사용 환경에 맞춘 기본형 제품입니다.`,
    detailedDescription: (categoryName) =>
      `${categoryName}을 처음 사용하는 사용자도 부담 없이 선택할 수 있도록 기본 기능과 안정적인 사용성을 중심으로 구성한 제품입니다.`,
  },
  {
    description: (categoryName) =>
      `일상적인 ${categoryName} 활용에 적합한 균형형 제품입니다.`,
    detailedDescription: (categoryName) =>
      `반복적인 사용에도 안정적인 조작감을 제공하도록 구성했으며, 다양한 작업 환경에 자연스럽게 어울리는 ${categoryName} 제품입니다.`,
  },
  {
    description: (categoryName) =>
      `작업 공간을 깔끔하게 구성할 수 있는 ${categoryName} 제품입니다.`,
    detailedDescription: () =>
      `군더더기 없는 디자인과 실용적인 기능을 중심으로 설계해 데스크 셋업이나 이동 환경에서도 부담 없이 사용할 수 있습니다.`,
  },
  {
    description: (categoryName) =>
      `가벼운 사용감과 안정성을 고려한 ${categoryName} 제품입니다.`,
    detailedDescription: () =>
      `처음 사용하는 사용자부터 반복 작업이 많은 사용자까지 편하게 쓸 수 있도록 기본 성능, 휴대성, 관리 편의성을 함께 고려했습니다.`,
  },
  {
    description: (categoryName) =>
      `${categoryName} 카테고리의 핵심 기능을 담은 실용형 제품입니다.`,
    detailedDescription: () =>
      `필요한 기능을 쉽게 찾고 사용할 수 있도록 구성했으며, 과한 장식보다 안정적인 사용 경험과 직관적인 조작에 초점을 맞췄습니다.`,
  },
];

type SupplementalProductCategorySeed = {
  categoryName: PortfolioProductCategoryName;
  nameKo: string;
  nameEn: string;
  slugPrefix: string;
  keywords: string[];
  basePrice: number;
  colors: PortfolioColorName[];
  productCount?: number;
};

type SupplementalProductDetailProfile = {
  dimensions: string[];
  technicalSpecs: string[];
  compatibility: string[];
  inTheBox: string[];
  support: string[];
};

const supplementalProductCategories: SupplementalProductCategorySeed[] = [
  {
    categoryName: 'mice',
    nameKo: '마우스',
    nameEn: 'Mouse',
    slugPrefix: 'mouse',
    keywords: ['마우스', '무선 마우스', '업무용 마우스'],
    basePrice: 39000,
    colors: [],
    productCount: 15,
  },
  {
    categoryName: 'keyboards',
    nameKo: '키보드',
    nameEn: 'Keyboard',
    slugPrefix: 'keyboard',
    keywords: ['키보드', '무선 키보드', '업무용 키보드'],
    basePrice: 59000,
    colors: [],
    productCount: 15,
  },
  {
    categoryName: 'tablet-keyboards',
    nameKo: '태블릿 키보드',
    nameEn: 'Tablet Keyboard',
    slugPrefix: 'tablet-keyboard',
    keywords: ['태블릿 키보드', '블루투스 키보드', '휴대용 키보드'],
    basePrice: 49000,
    colors: [],
    productCount: 10,
  },
  {
    categoryName: 'headsets',
    nameKo: '헤드셋',
    nameEn: 'Headset',
    slugPrefix: 'headset',
    keywords: ['헤드셋', '무선 헤드셋', '업무용 헤드셋'],
    basePrice: 69000,
    colors: [],
    productCount: 6,
  },
  {
    categoryName: 'earphones',
    nameKo: '이어폰',
    nameEn: 'Earphones',
    slugPrefix: 'earphones',
    keywords: ['이어폰', '무선 이어폰', '블루투스 이어폰'],
    basePrice: 49000,
    colors: [],
    productCount: 5,
  },
  {
    categoryName: 'microphones',
    nameKo: '마이크',
    nameEn: 'Microphone',
    slugPrefix: 'microphone',
    keywords: ['마이크', 'USB 마이크', '방송용 마이크'],
    basePrice: 79000,
    colors: [],
    productCount: 4,
  },
  {
    categoryName: 'webcams',
    nameKo: '웹캠',
    nameEn: 'Webcam',
    slugPrefix: 'webcam',
    keywords: ['웹캠', '화상회의 카메라', '스트리밍 웹캠'],
    basePrice: 59000,
    colors: [],
    productCount: 5,
  },
  {
    categoryName: 'cameras',
    nameKo: '카메라',
    nameEn: 'Camera',
    slugPrefix: 'camera',
    keywords: ['카메라', '콘텐츠 카메라', '영상 촬영 장비'],
    basePrice: 159000,
    colors: [],
    productCount: 10,
  },
  {
    categoryName: 'lighting',
    nameKo: '조명',
    nameEn: 'Light',
    slugPrefix: 'light',
    keywords: ['LED 조명', '링라이트', '촬영 조명'],
    basePrice: 39000,
    colors: [],
    productCount: 10,
  },
  {
    categoryName: 'streaming-gear',
    nameKo: '스트리밍 장비',
    nameEn: 'Streaming Gear',
    slugPrefix: 'streaming-gear',
    keywords: ['오디오 인터페이스', '캡처 카드', '스트림 덱', '마이크 암'],
    basePrice: 89000,
    colors: [],
    productCount: 10,
  },
  {
    categoryName: 'tablet-accessories',
    nameKo: '태블릿 액세서리',
    nameEn: 'Tablet Accessory',
    slugPrefix: 'tablet-accessory',
    keywords: ['태블릿 스탠드', '태블릿 케이스', '태블릿 펜'],
    basePrice: 19000,
    colors: [],
    productCount: 15,
  },
  {
    categoryName: 'phone-accessories',
    nameKo: '스마트폰 액세서리',
    nameEn: 'Phone Accessory',
    slugPrefix: 'phone-accessory',
    keywords: ['스마트폰 케이스', '스마트폰 거치대', '무선 충전 스탠드'],
    basePrice: 19000,
    colors: [],
    productCount: 15,
  },
  {
    categoryName: 'stands',
    nameKo: '거치대',
    nameEn: 'Stand',
    slugPrefix: 'stand',
    keywords: ['웹캠 마운트', '헤드폰 스탠드', '마이크 암'],
    basePrice: 29000,
    colors: [],
    productCount: 4,
  },
  {
    categoryName: 'cables',
    nameKo: '케이블',
    nameEn: 'Cable',
    slugPrefix: 'cable',
    keywords: ['USB-C 케이블', 'HDMI 케이블', '오디오 케이블'],
    basePrice: 9000,
    colors: [],
    productCount: 5,
  },
  {
    categoryName: 'bluetooth-speakers',
    nameKo: 'Bluetooth 스피커',
    nameEn: 'Bluetooth Speaker',
    slugPrefix: 'bluetooth-speaker',
    keywords: ['Bluetooth 스피커', '휴대용 스피커', '무선 스피커'],
    basePrice: 49000,
    colors: [],
    productCount: 6,
  },
  {
    categoryName: 'computer-speakers',
    nameKo: '컴퓨터 스피커',
    nameEn: 'Computer Speaker',
    slugPrefix: 'computer-speaker',
    keywords: ['컴퓨터 스피커', '데스크 스피커', 'PC 스피커'],
    basePrice: 59000,
    colors: [],
    productCount: 5,
  },
  {
    categoryName: 'security-cameras',
    nameKo: '보안 카메라',
    nameEn: 'Security Camera',
    slugPrefix: 'security-camera',
    keywords: ['보안 카메라', '실내 카메라', '홈 카메라'],
    basePrice: 69000,
    colors: [],
    productCount: 5,
  },
  {
    categoryName: 'smart-home',
    nameKo: '스마트 홈',
    nameEn: 'Smart Home',
    slugPrefix: 'smart-home',
    keywords: ['스마트 홈', '스마트 전구', 'IoT 조명'],
    basePrice: 29000,
    colors: [],
    productCount: 2,
  },
];

const supplementalProductColorOverridesByCategory: Partial<
  Record<PortfolioProductCategoryName, Record<string, PortfolioColorName[]>>
> = {
  mice: {
    'aster-mouse-mini': ['그래파이트', '샌드베이지'],
    'breeze-mouse-desk': ['블루', '세이지그린'],
    'lumen-mouse-slim': ['그래파이트', '라일락', '페일그레이'],
    'pixel-mouse-flow': ['페일그레이', '샌드베이지'],
  },
  keyboards: {
    'mellow-keys-pro': ['라일락', '로즈핑크', '샌드베이지'],
    'nova-keys-air': ['그래파이트', '오프화이트', '레드'],
    'slate-keys-go': ['블루', '그래파이트'],
  },
  'tablet-keyboards': {
    'lumen-tablet-keys-slim': ['그래파이트', '로즈핑크'],
    'nova-tablet-keys-air': ['페일그레이', '세이지그린', '샌드베이지'],
  },
  headsets: {
    'mellow-headset-pro': ['블루', '라일락', '페일그레이'],
    'nova-headset-air': ['그래파이트', '샌드베이지'],
  },

  earphones: {
    'civic-earbuds-studio': ['그래파이트', '샌드베이지'],
    'lumen-earbuds-slim': ['블루', '그래파이트', '오프화이트'],
    'nova-earbuds-air': ['블루', '레드', '샌드베이지'],
  },
  cables: {
    'aster-cable-mini': ['그래파이트', '페일그레이'],
    'mellow-cable-pro': ['블루', '레드'],
  },
  'bluetooth-speakers': {
    'beacon-speaker-flex': ['그래파이트', '페일그레이'],
    'lumen-speaker-slim': ['그래파이트', '라일락', '로즈핑크'],
    'pixel-speaker-flow': ['블루', '세이지그린', '샌드베이지'],
  },
  'computer-speakers': {
    'aster-desk-speaker-mini': ['그래파이트', '페일그레이'],
    'civic-desk-speaker-studio': ['그래파이트', '세이지그린', '샌드베이지'],
  },
};

const supplementalProductDetailProfiles: Record<
  PortfolioProductCategoryName,
  SupplementalProductDetailProfile
> = {
  mice: {
    dimensions: ['높이: 112mm', '너비: 64mm', '깊이: 38mm', '무게: 92g'],
    technicalSpecs: [
      '무선 연결 지원',
      '조절 가능한 포인터 감도',
      '저소음 클릭 설계',
      '반복 작업에 적합한 곡면 그립',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', 'ChromeOS'],
    inTheBox: ['무선 마우스', '충전 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '온라인 제품 가이드 제공'],
  },
  keyboards: {
    dimensions: ['높이: 132mm', '너비: 366mm', '깊이: 22mm', '무게: 620g'],
    technicalSpecs: [
      '무선 연결 지원',
      '멀티 디바이스 전환',
      '낮은 높이의 키 프로파일',
      '긴 문서 작업에 적합한 안정적인 키감',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', 'iPadOS', 'ChromeOS'],
    inTheBox: ['무선 키보드', '충전 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '키보드 설정 가이드 제공'],
  },
  'tablet-keyboards': {
    dimensions: ['높이: 186mm', '너비: 252mm', '깊이: 18mm', '무게: 480g'],
    technicalSpecs: [
      '태블릿 거치 각도 지원',
      '블루투스 연결',
      '휴대용 슬림 디자인',
      '문서 작성과 메모 작업에 적합한 키 배열',
    ],
    compatibility: ['iPadOS', 'Android 태블릿', 'Bluetooth 지원 기기'],
    inTheBox: ['태블릿 키보드', '충전 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '태블릿 연결 가이드 제공'],
  },
  headsets: {
    dimensions: ['높이: 178mm', '너비: 164mm', '깊이: 72mm', '무게: 238g'],
    technicalSpecs: [
      '노이즈 저감 마이크',
      '장시간 착용을 고려한 이어패드',
      '음성 통화와 온라인 회의에 맞춘 튜닝',
      '유선 또는 무선 연결 지원',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', 'USB 오디오 지원 기기'],
    inTheBox: ['헤드셋', '충전 또는 연결 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '마이크 설정 가이드 제공'],
  },
  earphones: {
    dimensions: ['케이스 높이: 48mm', '케이스 너비: 58mm', '무게: 54g'],
    technicalSpecs: [
      '블루투스 연결',
      '휴대용 충전 케이스',
      '통화용 내장 마이크',
      '일상 청취에 적합한 균형형 사운드',
    ],
    compatibility: ['iOS', 'Android', 'Bluetooth 지원 노트북'],
    inTheBox: ['무선 이어폰', '충전 케이스', '이어팁 세트', '충전 케이블'],
    support: ['기본 보증 1년', '페어링 가이드 제공'],
  },
  microphones: {
    dimensions: ['높이: 156mm', '너비: 52mm', '깊이: 52mm', '무게: 320g'],
    technicalSpecs: [
      'USB 연결',
      '음성 녹음에 적합한 지향성 패턴',
      '간편한 게인 조절',
      '방송과 회의에 모두 사용할 수 있는 데스크형 구성',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', 'USB-C 지원 기기'],
    inTheBox: ['USB 마이크', '데스크 스탠드', 'USB 케이블'],
    support: ['기본 보증 1년', '녹음 설정 가이드 제공'],
  },
  webcams: {
    dimensions: ['높이: 42mm', '너비: 78mm', '깊이: 34mm', '무게: 112g'],
    technicalSpecs: [
      'Full HD 영상 촬영',
      '자동 노출 보정',
      '모니터 거치 클립',
      '화상회의와 스트리밍에 적합한 시야각',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', '주요 화상회의 앱'],
    inTheBox: ['웹캠', '모니터 클립', 'USB 케이블'],
    support: ['기본 보증 1년', '카메라 설정 가이드 제공'],
  },
  cameras: {
    dimensions: ['높이: 68mm', '너비: 112mm', '깊이: 52mm', '무게: 284g'],
    technicalSpecs: [
      '콘텐츠 촬영용 센서',
      '삼각대 장착 지원',
      '자동 초점 지원',
      '실내 촬영에 적합한 색감 보정',
    ],
    compatibility: ['USB 비디오 입력 지원 기기', '주요 스트리밍 앱'],
    inTheBox: ['카메라 본체', '연결 케이블', '마운트 어댑터'],
    support: ['기본 보증 1년', '촬영 설정 가이드 제공'],
  },
  lighting: {
    dimensions: ['높이: 210mm', '너비: 180mm', '깊이: 32mm', '무게: 430g'],
    technicalSpecs: [
      '밝기 단계 조절',
      '색온도 조절',
      '책상 또는 삼각대 거치 지원',
      '화상회의와 촬영에 적합한 확산광',
    ],
    compatibility: ['USB 전원 어댑터', '데스크 거치 환경', '촬영용 삼각대'],
    inTheBox: ['LED 조명', '거치대', '전원 케이블'],
    support: ['기본 보증 1년', '조명 배치 가이드 제공'],
  },
  'streaming-gear': {
    dimensions: ['높이: 86mm', '너비: 142mm', '깊이: 32mm', '무게: 260g'],
    technicalSpecs: [
      '스트리밍 워크플로우 제어',
      'USB 연결',
      '커스텀 단축 실행 지원',
      '방송 장비와 함께 쓰기 좋은 컴팩트 설계',
    ],
    compatibility: ['Windows 10 이상', 'macOS 12 이상', '주요 방송 소프트웨어'],
    inTheBox: ['스트리밍 장비 본체', 'USB 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '방송 설정 가이드 제공'],
  },
  'tablet-accessories': {
    dimensions: ['높이: 245mm', '너비: 182mm', '깊이: 18mm', '무게: 260g'],
    technicalSpecs: [
      '태블릿 휴대와 거치를 고려한 구조',
      '스크래치 방지 소재',
      '가방 수납이 쉬운 슬림 형태',
      '일상 사용에 맞춘 내구성',
    ],
    compatibility: ['주요 10-13형 태블릿', 'USB-C 태블릿 액세서리 환경'],
    inTheBox: ['태블릿 액세서리 본품', '간단 사용 설명서'],
    support: ['기본 보증 1년', '호환 모델 안내 제공'],
  },
  'phone-accessories': {
    dimensions: ['높이: 98mm', '너비: 68mm', '깊이: 14mm', '무게: 84g'],
    technicalSpecs: [
      '스마트폰 휴대와 거치 지원',
      '무선 충전 환경을 고려한 설계',
      '일상 사용에 적합한 소재',
      '가방과 주머니에 넣기 쉬운 크기',
    ],
    compatibility: ['주요 스마트폰', '무선 충전 지원 기기'],
    inTheBox: ['스마트폰 액세서리 본품', '간단 사용 설명서'],
    support: ['기본 보증 1년', '호환 기기 안내 제공'],
  },
  stands: {
    dimensions: ['높이: 168mm', '너비: 124mm', '깊이: 118mm', '무게: 540g'],
    technicalSpecs: [
      '높이와 각도 조절 지원',
      '케이블 정리를 고려한 구조',
      '책상 위 장비를 안정적으로 고정',
      '웹캠, 헤드폰, 마이크 주변 장비와 함께 사용 가능',
    ],
    compatibility: ['데스크 셋업', '웹캠 및 오디오 주변 장비'],
    inTheBox: ['거치대 본체', '조립 부품', '간단 사용 설명서'],
    support: ['기본 보증 1년', '조립 가이드 제공'],
  },
  cables: {
    dimensions: ['길이: 1.5m', '두께: 4.2mm', '무게: 48g'],
    technicalSpecs: [
      '데이터 전송과 충전 지원',
      '꼬임을 줄인 외피',
      '일상적인 데스크 환경에 적합한 길이',
      '휴대용 충전기와 노트북 연결에 적합',
    ],
    compatibility: ['USB-C 지원 기기', 'HDMI 또는 오디오 지원 기기'],
    inTheBox: ['케이블 본품', '케이블 정리 밴드'],
    support: ['기본 보증 1년', '호환 규격 안내 제공'],
  },
  'bluetooth-speakers': {
    dimensions: ['높이: 84mm', '너비: 182mm', '깊이: 72mm', '무게: 620g'],
    technicalSpecs: [
      '블루투스 연결',
      '휴대용 배터리 내장',
      '실내외 사용에 적합한 출력',
      '간편한 볼륨과 재생 제어',
    ],
    compatibility: ['iOS', 'Android', 'Bluetooth 지원 노트북'],
    inTheBox: ['Bluetooth 스피커', '충전 케이블', '간단 사용 설명서'],
    support: ['기본 보증 1년', '페어링 가이드 제공'],
  },
  'computer-speakers': {
    dimensions: ['위성 스피커 높이: 158mm', '너비: 92mm', '깊이: 96mm'],
    technicalSpecs: [
      '데스크용 스테레오 출력',
      '간편한 볼륨 조절',
      'PC와 노트북에 적합한 연결 방식',
      '작업 공간에 어울리는 컴팩트 디자인',
    ],
    compatibility: ['Windows PC', 'macOS 기기', '3.5mm 또는 USB 오디오 출력'],
    inTheBox: ['컴퓨터 스피커 세트', '연결 케이블', '전원 어댑터'],
    support: ['기본 보증 1년', '오디오 연결 가이드 제공'],
  },
  'security-cameras': {
    dimensions: ['높이: 76mm', '너비: 62mm', '깊이: 62mm', '무게: 180g'],
    technicalSpecs: [
      '실내 모니터링 지원',
      '움직임 감지 알림',
      '벽면 또는 선반 설치 가능',
      '주간과 야간 사용을 고려한 영상 보정',
    ],
    compatibility: ['Wi-Fi 네트워크', '모바일 앱', '스마트 홈 환경'],
    inTheBox: ['보안 카메라', '마운트 키트', '전원 케이블'],
    support: ['기본 보증 1년', '설치 가이드 제공'],
  },
  'smart-home': {
    dimensions: ['높이: 112mm', '너비: 62mm', '깊이: 62mm', '무게: 96g'],
    technicalSpecs: [
      '스마트 홈 자동화 지원',
      '앱 기반 제어',
      '일상 조명과 IoT 환경에 적합',
      '간편한 장면 설정 지원',
    ],
    compatibility: ['Wi-Fi 네트워크', '모바일 앱', '스마트 홈 플랫폼'],
    inTheBox: ['스마트 홈 기기', '간단 사용 설명서'],
    support: ['기본 보증 1년', '앱 설정 가이드 제공'],
  },
};

const createEmptyImages = (slug: string): PortfolioProductImageSeed[] => [
  {
    image_url: '',
    order: 0,
    isMain: true,
    promptKey: `${slug}-main`,
  },
];

const createSupplementalDetails = (
  category: SupplementalProductCategorySeed,
): PortfolioProductDetailSeed[] => {
  const profile = supplementalProductDetailProfiles[category.categoryName];

  return [
    {
      titleId: 1,
      title_middle: '규격',
      title_sub: '제품 크기',
      specification: profile.dimensions,
      note: null,
    },
    {
      titleId: 1,
      title_middle: '기술 사양',
      title_sub: '주요 기능',
      specification: profile.technicalSpecs,
      note: null,
    },
    {
      titleId: 2,
      title_middle: null,
      title_sub: '호환성',
      specification: profile.compatibility,
      note: null,
    },
    {
      titleId: 3,
      title_middle: null,
      title_sub: '구성품',
      specification: profile.inTheBox,
      note: null,
    },
    {
      titleId: 4,
      title_middle: null,
      title_sub: '지원',
      specification: profile.support,
      note: null,
    },
  ];
};

const getSupplementalFilterOptions = (
  categoryName: PortfolioProductCategoryName,
  productLine: ProductLine,
  index: number,
) => {
  const categoryFilters = filterCatalog.find(
    (category) => category.categoryName === categoryName,
  );

  if (!categoryFilters) {
    return [];
  }

  return categoryFilters.filters.flatMap((filter, filterIndex) => {
    if (filter.name === '제품 라인') {
      return [supplementalProductLineFilterSlugs[productLine]];
    }

    if (filter.options.length === 0) {
      return [];
    }

    const optionIndex = (index + filterIndex) % filter.options.length;
    const option = filter.options[optionIndex];
    return option ? [option.name_en] : [];
  });
};

const getSupplementalProductCount = (
  category: SupplementalProductCategorySeed,
) => {
  const count =
    category.productCount ?? DEFAULT_SUPPLEMENTAL_PRODUCTS_PER_CATEGORY;

  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`Invalid productCount for ${category.categoryName}`);
  }

  if (count > supplementalProductNamePrefixes.length) {
    throw new Error(
      `productCount for ${category.categoryName} must be ${supplementalProductNamePrefixes.length} or less`,
    );
  }

  return count;
};

const supplementalPortfolioProducts: PortfolioProductSeed[] =
  supplementalProductCategories.flatMap((category) =>
    Array.from(
      { length: getSupplementalProductCount(category) },
      (_, index) => {
        const prefix = supplementalProductNamePrefixes[index];
        const nameVariant =
          supplementalProductNameVariants[
            index % supplementalProductNameVariants.length
          ];
        const nameNoun = supplementalProductNameNouns[
          category.categoryName
        ] ?? {
          en: category.nameEn,
          ko: category.nameKo,
        };
        const nameEn = `${prefix} ${nameNoun.en} ${nameVariant.en}`;
        const nameKo = `${prefix} ${nameNoun.ko} ${nameVariant.ko}`;
        const slug = toProductSlug(nameEn);
        const productLine =
          supplementalProductLines[index % supplementalProductLines.length];
        const copyPreset =
          supplementalProductCopyPresets[
            index % supplementalProductCopyPresets.length
          ];
        const colorOverride =
          supplementalProductColorOverridesByCategory[category.categoryName]?.[
            slug
          ];

        return {
          name_en: nameEn,
          name_ko: nameKo,
          slug,
          categoryName: category.categoryName,
          search_keyword: [category.nameKo, ...category.keywords].join(', '),
          description: copyPreset.description(category.nameKo),
          detailed_description: copyPreset.detailedDescription(category.nameKo),
          note: null,
          price: category.basePrice + index * 3000,
          discountRate:
            supplementalDiscountRates[index % supplementalDiscountRates.length],
          productLine,
          colors: colorOverride ?? category.colors,
          filterOptions: getSupplementalFilterOptions(
            category.categoryName,
            productLine,
            index,
          ),
          images: createEmptyImages(slug),
          details: createSupplementalDetails(category),
        };
      },
    ),
  );

export const portfolioProducts: PortfolioProductSeed[] = [
  ...supplementalPortfolioProducts,
];
