export type HomeSectionItemSeed = {
  itemKey: string;
  label?: string;
  title: string;
  description?: string;
  cta?: string;
  href?: string;
  targetCategorySlug?: string;
  targetProductSlug?: string;
  image_url?: string;
  imageAlt?: string;
  displayOrder: number;
  layoutGroup?: number;
  layoutGroupClassName?: string;
  layoutAreaClassName?: string;
  labelPosition?: 'top' | 'bottom';
  imageClassName?: string;
};

export const homeSectionItemsBySectionKey = {
  'featured-products': [
    {
      itemKey: 'aster-webcam-mini',
      label: 'Webcam',
      title: '작은 화면도 선명하게',
      description:
        'Aster Webcam Mini는 화상 회의와 온라인 수업에 필요한 선명한 화면을 작고 간결한 형태로 제공합니다.',
      cta: 'Aster Webcam Mini 보기',
      targetCategorySlug: 'webcams',
      targetProductSlug: 'aster-webcam-mini',
      imageAlt: 'Aster Webcam Mini',
      displayOrder: 1,
    },
    {
      itemKey: 'nook-keys-core',
      label: 'Keyboard',
      title: '정돈된 타건감의 기본',
      description:
        'Nook Keys Core는 데스크 위 공간을 차분하게 정리하면서 반복 작업에도 안정적인 입력감을 제공합니다.',
      cta: 'Nook Keys Core 보기',
      targetCategorySlug: 'keyboards',
      targetProductSlug: 'nook-keys-core',
      imageAlt: 'Nook Keys Core',
      displayOrder: 2,
    },
    {
      itemKey: 'breeze-mouse-desk',
      label: 'Mouse',
      title: '데스크에 가볍게 스며드는 마우스',
      description:
        'Breeze Mouse Desk는 깔끔한 작업 공간에 어울리는 부드러운 조작감과 편안한 사용성을 중심으로 설계되었습니다.',
      cta: 'Breeze Mouse Desk 보기',
      targetCategorySlug: 'mice',
      targetProductSlug: 'breeze-mouse-desk',
      imageAlt: 'Breeze Mouse Desk',
      displayOrder: 3,
    },
  ],
  'category-carousel': [
    {
      itemKey: 'mice',
      title: '마우스',
      imageAlt: '마우스',
      targetCategorySlug: 'mice',
      displayOrder: 1,
      layoutGroup: 1,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-j',
    },
    {
      itemKey: 'cameras',
      title: '카메라',
      imageAlt: '카메라',
      targetCategorySlug: 'cameras',
      displayOrder: 2,
      layoutGroup: 1,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-k',
      labelPosition: 'top',
    },
    {
      itemKey: 'tablet-keyboards',
      title: '태블릿 키보드',
      imageAlt: '태블릿 키보드',
      targetCategorySlug: 'tablet-keyboards',
      displayOrder: 3,
      layoutGroup: 1,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-l',
    },
    {
      itemKey: 'headsets',
      title: '헤드셋',
      imageAlt: '헤드셋',
      targetCategorySlug: 'headsets',
      displayOrder: 4,
      layoutGroup: 2,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-j',
      imageClassName: 'object-cover',
    },
    {
      itemKey: 'security-cameras',
      title: '보안 카메라',
      imageAlt: '보안 카메라',
      targetCategorySlug: 'security-cameras',
      displayOrder: 5,
      layoutGroup: 2,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-k',
    },
    {
      itemKey: 'streaming-gear',
      title: '스트리밍 장비',
      imageAlt: '스트리밍 장비',
      targetCategorySlug: 'streaming-gear',
      displayOrder: 6,
      layoutGroup: 2,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-l',
      labelPosition: 'top',
    },
    {
      itemKey: 'computer-speakers',
      title: '컴퓨터 스피커',
      imageAlt: '컴퓨터 스피커',
      targetCategorySlug: 'computer-speakers',
      displayOrder: 7,
      layoutGroup: 3,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-j',
    },
    {
      itemKey: 'webcams',
      title: '웹캠',
      imageAlt: '웹캠',
      targetCategorySlug: 'webcams',
      displayOrder: 8,
      layoutGroup: 3,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-k',
      imageClassName: 'object-cover',
    },
    {
      itemKey: 'smart-home',
      title: '스마트 홈',
      imageAlt: '스마트 홈',
      targetCategorySlug: 'smart-home',
      displayOrder: 9,
      layoutGroup: 3,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-l',
    },
    {
      itemKey: 'phone-accessories',
      title: '스마트폰용',
      imageAlt: '스마트폰용',
      targetCategorySlug: 'phone-accessories',
      displayOrder: 10,
      layoutGroup: 4,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-j',
      labelPosition: 'top',
    },
    {
      itemKey: 'bluetooth-speakers',
      title: 'Bluetooth® 스피커',
      imageAlt: 'Bluetooth® 스피커',
      targetCategorySlug: 'bluetooth-speakers',
      displayOrder: 11,
      layoutGroup: 4,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-k',
      imageClassName: 'object-cover',
    },
    {
      itemKey: 'keyboards',
      title: '키보드',
      imageAlt: '키보드',
      targetCategorySlug: 'keyboards',
      displayOrder: 12,
      layoutGroup: 4,
      layoutGroupClassName: 'lg:grid-areas-home-3',
      layoutAreaClassName: 'lg:grid-in-l',
    },
  ],
} satisfies Record<string, HomeSectionItemSeed[]>;
