type FilterCatalogOptionSeed = {
  name_ko: string;
  name_en: string;
};

type FilterCatalogFilterSeed = {
  name: string;
  options: FilterCatalogOptionSeed[];
};

export type FilterCatalogCategorySeed = {
  categoryName: string;
  filters: FilterCatalogFilterSeed[];
};

const productLineFilter: FilterCatalogFilterSeed = {
  name: '제품 라인',
  options: [
    { name_ko: '데일리 라인', name_en: 'everyday-line' },
    { name_ko: '비즈니스 라인', name_en: 'business-series' },
    { name_ko: '퍼포먼스 라인', name_en: 'performance-series' },
  ],
};

const baseFilterCatalog: FilterCatalogCategorySeed[] = [
  {
    categoryName: 'mice',
    filters: [
      {
        name: '연결 방식',
        options: [
          { name_ko: '무선', name_en: 'wireless' },
          { name_ko: 'Bluetooth', name_en: 'bluetooth' },
          { name_ko: 'USB 수신기', name_en: 'usb-receiver' },
        ],
      },
      {
        name: '손 크기',
        options: [
          { name_ko: '작음', name_en: 'small' },
          { name_ko: '보통', name_en: 'medium' },
          { name_ko: '큼', name_en: 'large' },
        ],
      },
      {
        name: '주 사용손',
        options: [
          { name_ko: '오른손', name_en: 'right' },
          { name_ko: '왼손', name_en: 'left' },
          { name_ko: '양손', name_en: 'ambidextrous' },
        ],
      },
    ],
  },
  {
    categoryName: 'keyboards',
    filters: [
      {
        name: '연결 방식',
        options: [
          { name_ko: '무선', name_en: 'wireless' },
          { name_ko: 'Bluetooth', name_en: 'bluetooth' },
          { name_ko: 'USB 수신기', name_en: 'usb-receiver' },
        ],
      },
      {
        name: '타이핑 느낌',
        options: [
          { name_ko: '노트북 같은 키', name_en: 'laptop-like-keys' },
          { name_ko: '딥 프로파일 키', name_en: 'deep-profile-keys' },
          { name_ko: '기계적 키', name_en: 'mechanical-keys' },
        ],
      },
    ],
  },
  {
    categoryName: 'tablet-keyboards',
    filters: [
      {
        name: '호환 기기',
        options: [
          { name_ko: 'iPad용', name_en: 'for-ipad' },
          { name_ko: 'Android 태블릿용', name_en: 'for-android-tablet' },
          { name_ko: '범용 태블릿용', name_en: 'universal-tablet' },
        ],
      },
      {
        name: '형태',
        options: [
          { name_ko: '폴리오형', name_en: 'folio' },
          { name_ko: '분리형', name_en: 'detachable' },
          { name_ko: '컴팩트형', name_en: 'compact' },
        ],
      },
    ],
  },
  {
    categoryName: 'headsets',
    filters: [
      {
        name: '연결 방식',
        options: [
          { name_ko: '무선', name_en: 'wireless' },
          { name_ko: '유선', name_en: 'wired' },
          { name_ko: 'USB', name_en: 'usb' },
        ],
      },
      {
        name: '용도',
        options: [
          { name_ko: '화상회의', name_en: 'for-meetings' },
          { name_ko: '고객 상담', name_en: 'for-call-center' },
          { name_ko: '게임', name_en: 'for-gaming' },
        ],
      },
    ],
  },
  {
    categoryName: 'earphones',
    filters: [
      {
        name: '연결 방식',
        options: [
          { name_ko: 'Bluetooth', name_en: 'bluetooth' },
          { name_ko: 'USB-C', name_en: 'usb-c' },
          { name_ko: '무선 충전', name_en: 'wireless-charging' },
        ],
      },
      {
        name: '착용 형태',
        options: [
          { name_ko: '인이어', name_en: 'in-ear' },
          { name_ko: '오픈형', name_en: 'open-fit' },
          { name_ko: '스포츠형', name_en: 'sport-fit' },
        ],
      },
    ],
  },
  {
    categoryName: 'microphones',
    filters: [
      {
        name: '연결 방식',
        options: [
          { name_ko: 'USB', name_en: 'usb' },
          { name_ko: 'XLR', name_en: 'xlr' },
          { name_ko: '무선', name_en: 'wireless' },
        ],
      },
      {
        name: '마이크 형태',
        options: [
          { name_ko: '데스크형', name_en: 'desktop' },
          { name_ko: '핀마이크', name_en: 'lavalier' },
          { name_ko: '스튜디오형', name_en: 'studio' },
        ],
      },
    ],
  },
  {
    categoryName: 'webcams',
    filters: [
      {
        name: '해상도',
        options: [
          { name_ko: 'Full HD', name_en: 'full-hd' },
          { name_ko: '2K', name_en: '2k' },
          { name_ko: '4K', name_en: '4k' },
        ],
      },
      {
        name: '기능',
        options: [
          { name_ko: '자동 초점', name_en: 'autofocus' },
          { name_ko: '프라이버시 셔터', name_en: 'privacy-shutter' },
          { name_ko: '광각', name_en: 'wide-angle' },
        ],
      },
    ],
  },
  {
    categoryName: 'cameras',
    filters: [
      {
        name: '용도',
        options: [
          { name_ko: '콘텐츠 촬영', name_en: 'content-creation' },
          { name_ko: '라이브 스트리밍', name_en: 'live-streaming' },
          { name_ko: '화상회의', name_en: 'video-meetings' },
        ],
      },
      {
        name: '설치 방식',
        options: [
          { name_ko: '삼각대', name_en: 'tripod' },
          { name_ko: '모니터 거치', name_en: 'monitor-mount' },
          { name_ko: '데스크 거치', name_en: 'desk-mount' },
        ],
      },
    ],
  },
  {
    categoryName: 'lighting',
    filters: [
      {
        name: '조명 형태',
        options: [
          { name_ko: 'LED 패널', name_en: 'led-panel' },
          { name_ko: '링라이트', name_en: 'ring-light' },
          { name_ko: '바 조명', name_en: 'light-bar' },
        ],
      },
      {
        name: '조절 기능',
        options: [
          { name_ko: '밝기 조절', name_en: 'brightness-control' },
          { name_ko: '색온도 조절', name_en: 'color-temperature' },
          { name_ko: '앱 제어', name_en: 'app-control' },
        ],
      },
    ],
  },
  {
    categoryName: 'streaming-gear',
    filters: [
      {
        name: '장비 유형',
        options: [
          { name_ko: '오디오 인터페이스', name_en: 'audio-interface' },
          { name_ko: '캡처 카드', name_en: 'capture-card' },
          { name_ko: '스트림 덱', name_en: 'stream-deck' },
          { name_ko: '마이크 암', name_en: 'mic-arm' },
        ],
      },
      {
        name: '연결 방식',
        options: [
          { name_ko: 'USB-C', name_en: 'usb-c' },
          { name_ko: 'HDMI', name_en: 'hdmi' },
          { name_ko: 'XLR', name_en: 'xlr' },
        ],
      },
    ],
  },
  {
    categoryName: 'tablet-accessories',
    filters: [
      {
        name: '제품 유형',
        options: [
          { name_ko: '태블릿 스탠드', name_en: 'tablet-stand' },
          { name_ko: '태블릿 케이스', name_en: 'tablet-case' },
          { name_ko: '태블릿 펜', name_en: 'tablet-pen' },
        ],
      },
      {
        name: '사용 환경',
        options: [
          { name_ko: '데스크용', name_en: 'for-desk' },
          { name_ko: '휴대용', name_en: 'portable' },
          { name_ko: '학습용', name_en: 'for-study' },
        ],
      },
    ],
  },
  {
    categoryName: 'phone-accessories',
    filters: [
      {
        name: '제품 유형',
        options: [
          { name_ko: '스마트폰 케이스', name_en: 'phone-case' },
          { name_ko: '무선 충전 스탠드', name_en: 'wireless-charger' },
          { name_ko: '차량용 거치대', name_en: 'car-mount' },
        ],
      },
      {
        name: '사용 환경',
        options: [
          { name_ko: '데스크용', name_en: 'for-desk' },
          { name_ko: '차량용', name_en: 'for-car' },
          { name_ko: '휴대용', name_en: 'portable' },
        ],
      },
    ],
  },
  {
    categoryName: 'stands',
    filters: [
      {
        name: '거치 대상',
        options: [
          { name_ko: '웹캠', name_en: 'for-webcam' },
          { name_ko: '헤드폰', name_en: 'for-headphones' },
          { name_ko: '마이크', name_en: 'for-microphone' },
          { name_ko: '모니터', name_en: 'for-monitor' },
        ],
      },
      {
        name: '설치 방식',
        options: [
          { name_ko: '데스크형', name_en: 'desktop' },
          { name_ko: '클램프형', name_en: 'clamp' },
          { name_ko: '접이식', name_en: 'foldable' },
        ],
      },
    ],
  },
  {
    categoryName: 'cables',
    filters: [
      {
        name: '케이블 유형',
        options: [
          { name_ko: 'USB-C', name_en: 'usb-c' },
          { name_ko: 'HDMI', name_en: 'hdmi' },
          { name_ko: '오디오', name_en: 'audio' },
          { name_ko: '정리 액세서리', name_en: 'cable-management' },
        ],
      },
      {
        name: '길이',
        options: [
          { name_ko: '1m 이하', name_en: 'under-1m' },
          { name_ko: '1-2m', name_en: '1-2m' },
          { name_ko: '2m 이상', name_en: 'over-2m' },
        ],
      },
    ],
  },
  {
    categoryName: 'bluetooth-speakers',
    filters: [
      {
        name: '사용 환경',
        options: [
          { name_ko: '실내용', name_en: 'indoor' },
          { name_ko: '휴대용', name_en: 'portable' },
          { name_ko: '아웃도어', name_en: 'outdoor' },
        ],
      },
      {
        name: '기능',
        options: [
          { name_ko: '방수', name_en: 'water-resistant' },
          { name_ko: '스테레오 페어링', name_en: 'stereo-pairing' },
          { name_ko: '긴 배터리', name_en: 'long-battery' },
        ],
      },
    ],
  },
  {
    categoryName: 'computer-speakers',
    filters: [
      {
        name: '채널 구성',
        options: [
          { name_ko: '2채널', name_en: '2-channel' },
          { name_ko: '2.1채널', name_en: '2-1-channel' },
          { name_ko: '사운드바', name_en: 'soundbar' },
        ],
      },
      {
        name: '연결 방식',
        options: [
          { name_ko: 'USB', name_en: 'usb' },
          { name_ko: 'Bluetooth', name_en: 'bluetooth' },
          { name_ko: '3.5mm', name_en: '3-5mm' },
        ],
      },
    ],
  },
  {
    categoryName: 'security-cameras',
    filters: [
      {
        name: '설치 위치',
        options: [
          { name_ko: '실내용', name_en: 'indoor' },
          { name_ko: '실외용', name_en: 'outdoor' },
          { name_ko: '현관용', name_en: 'doorway' },
        ],
      },
      {
        name: '기능',
        options: [
          { name_ko: '움직임 감지', name_en: 'motion-detection' },
          { name_ko: '야간 촬영', name_en: 'night-vision' },
          { name_ko: '양방향 음성', name_en: 'two-way-audio' },
        ],
      },
    ],
  },
  {
    categoryName: 'smart-home',
    filters: [
      {
        name: '제품 유형',
        options: [
          { name_ko: '스마트 전구', name_en: 'smart-bulb' },
          { name_ko: 'IoT 조명', name_en: 'iot-lighting' },
          { name_ko: '센서', name_en: 'sensor' },
        ],
      },
      {
        name: '제어 방식',
        options: [
          { name_ko: '앱 제어', name_en: 'app-control' },
          { name_ko: '음성 제어', name_en: 'voice-control' },
          { name_ko: '자동화', name_en: 'automation' },
        ],
      },
    ],
  },
];

export const filterCatalog: FilterCatalogCategorySeed[] = baseFilterCatalog.map(
  (category) => ({
    ...category,
    filters: [productLineFilter, ...category.filters],
  }),
);
