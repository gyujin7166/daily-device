import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

import {
  heroTranslations,
  homeSectionItemTranslations,
  homeSectionTranslations,
} from './data/i18n-content';

const prisma = new PrismaClient();

const categoryEnglishNameBySlug: Record<string, string> = {
  accessories: 'Accessories',
  'audio-microphones': 'Audio & Microphones',
  'cameras-streaming': 'Cameras & Streaming',
  'mice-keyboards': 'Mice & Keyboards',
  'speakers-smart-home': 'Speakers & Smart Home',
};

const filterEnglishNameByKorean: Record<string, string> = {
  기능: 'Features',
  길이: 'Length',
  '마이크 형태': 'Microphone Type',
  '손 크기': 'Hand Size',
  '설치 방식': 'Mounting Style',
  '설치 위치': 'Placement',
  '연결 방식': 'Connection',
  '용도': 'Use Case',
  '제품 라인': 'Product Line',
  '제품 유형': 'Product Type',
  '조명 형태': 'Lighting Type',
  '조절 기능': 'Controls',
  '주 사용손': 'Primary Hand',
  '착용 형태': 'Fit Type',
  '채널 구성': 'Channel Setup',
  '케이블 유형': 'Cable Type',
  '타이핑 느낌': 'Typing Feel',
  '호환 기기': 'Compatible Device',
  '거치 대상': 'Mount Target',
  '사용 환경': 'Use Environment',
  '장비 유형': 'Gear Type',
  '제어 방식': 'Control Method',
  해상도: 'Resolution',
  형태: 'Form Factor',
};

const filterOptionEnglishNameBySlug: Record<string, string> = {
  '2-1-channel': '2.1 Channel',
  '2-channel': '2 Channel',
  '3-5mm': '3.5 mm',
  'usb-c': 'USB-C',
  'usb-receiver': 'USB Receiver',
  'full-hd': 'Full HD',
  '2k': '2K',
  '4k': '4K',
  xlr: 'XLR',
  usb: 'USB',
  hdmi: 'HDMI',
  bluetooth: 'Bluetooth',
  ipad: 'iPad',
};

const colorEnglishNameByKorean: Record<string, string> = {
  그래파이트: 'Graphite',
  라일락: 'Lilac',
  레드: 'Red',
  로즈핑크: 'Rose Pink',
  블루: 'Blue',
  샌드베이지: 'Sand Beige',
  세이지그린: 'Sage Green',
  오프화이트: 'Off White',
  페일그레이: 'Pale Gray',
};

const productDetailEnglishTitleByKorean: Record<string, string> = {
  구성품: 'In the Box',
  규격: 'Dimensions',
  기술: 'Technology',
  기술사양: 'Technical Specifications',
  지원: 'Support',
  주요기능: 'Key Features',
  제품크기: 'Product Size',
  호환성: 'Compatibility',
  '기술 사양': 'Technical Specifications',
  '제품 크기': 'Product Size',
  '주요 기능': 'Key Features',
};

const productDetailEnglishSpecByKorean: Record<string, string> = {
  '구성품': 'Included items',
  길이: 'Length',
  깊이: 'Depth',
  너비: 'Width',
  높이: 'Height',
  두께: 'Thickness',
  무게: 'Weight',
  '기술 사양': 'Technical specifications',
  '주요 기능': 'Key features',
  '제품 크기': 'Product dimensions',
  케이스너비: 'Case width',
  케이스높이: 'Case height',
  위성스피커높이: 'Satellite speaker height',
  '케이스 너비': 'Case width',
  '케이스 높이': 'Case height',
  '위성 스피커 높이': 'Satellite speaker height',
  '지원': 'Support',
  '호환성': 'Compatibility',
};

const titleCaseFromSlug = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

const normalizeEnglishFilterOptionName = (slug: string) =>
  filterOptionEnglishNameBySlug[slug] ?? titleCaseFromSlug(slug);

const compactKoreanKey = (value: string) => value.replace(/\s+/g, '');

const normalizeEnglishProductDetailTitle = (value: string | null) => {
  if (!value) {
    return null;
  }

  return (
    productDetailEnglishTitleByKorean[value] ??
    productDetailEnglishTitleByKorean[compactKoreanKey(value)] ??
    value
  );
};

const normalizeEnglishProductDetailSpecification = (
  specification: string | null,
) => {
  if (!specification) {
    return null;
  }

  try {
    const parsed = JSON.parse(specification);

    if (!Array.isArray(parsed)) {
      return specification;
    }

    return JSON.stringify(
      parsed.map((item) => {
        if (typeof item !== 'string') {
          return item;
        }

        const separatorIndex = item.indexOf(':');

        if (separatorIndex === -1) {
          return productDetailEnglishSpecByKorean[item] ?? item;
        }

        const label = item.slice(0, separatorIndex).trim();
        const value = item.slice(separatorIndex + 1).trim();
        const translatedLabel =
          productDetailEnglishSpecByKorean[label] ??
          productDetailEnglishSpecByKorean[compactKoreanKey(label)] ??
          label;

        return `${translatedLabel}: ${value}`;
      }),
    );
  } catch {
    return specification;
  }
};

const normalizeEnglishCategoryName = (name: string, slug: string) => {
  const mappedName = categoryEnglishNameBySlug[slug];

  if (mappedName) {
    return mappedName;
  }

  if (name.includes('-') || name.includes('_')) {
    return titleCaseFromSlug(slug);
  }

  if (/^[a-z0-9]+$/.test(name)) {
    return titleCaseFromSlug(name);
  }

  return name;
};

const getEnglishProductCategoryNoun = (slug: string, name: string) => {
  const nounBySlug: Record<string, string> = {
    mice: 'mouse',
    keyboards: 'keyboard',
    'tablet-keyboards': 'tablet keyboard',
    headsets: 'headset',
    earphones: 'earphones',
    microphones: 'microphone',
    webcams: 'webcam',
    cameras: 'camera',
    lighting: 'lighting',
    'streaming-gear': 'streaming gear',
    'computer-speakers': 'speaker',
    'bluetooth-speakers': 'Bluetooth speaker',
    'smart-home': 'smart home',
    'phone-accessories': 'phone accessory',
    'tablet-accessories': 'tablet accessory',
    cables: 'cable',
    stands: 'stand',
    'security-cameras': 'security camera',
  };

  return nounBySlug[slug] ?? name.toLowerCase();
};

const getEnglishProductCopy = (params: {
  categoryName: string;
  productName: string;
  koreanDescription: string;
}) => {
  const { categoryName, productName, koreanDescription } = params;

  if (koreanDescription.includes('사용 환경에 맞춘 기본형')) {
    return {
      description: `${productName} is an approachable ${categoryName} for everyday setup and reliable basic use.`,
      detailedDescription: `${productName} keeps the essentials simple, making it easy to add dependable ${categoryName} performance to a daily workspace.`,
    };
  }

  if (koreanDescription.includes('일상적인') && koreanDescription.includes('균형형')) {
    return {
      description: `${productName} offers balanced ${categoryName} performance for routine work, calls, and daily movement.`,
      detailedDescription: `${productName} is tuned for repeated use with stable handling and a design that fits naturally into different work environments.`,
    };
  }

  if (koreanDescription.includes('작업 공간을 깔끔하게')) {
    return {
      description: `${productName} keeps the desk organized with a clean, practical ${categoryName} setup.`,
      detailedDescription: `${productName} focuses on a streamlined look and useful functions, so it works well in both desk setups and flexible everyday spaces.`,
    };
  }

  if (koreanDescription.includes('가벼운 사용감과 안정성')) {
    return {
      description: `${productName} is a lightweight ${categoryName} designed for steady, comfortable use.`,
      detailedDescription: `${productName} balances basic performance, portability, and easy maintenance for both first-time users and repeated daily tasks.`,
    };
  }

  if (koreanDescription.includes('핵심 기능을 담은 실용형')) {
    return {
      description: `${productName} covers the core ${categoryName} features most users need.`,
      detailedDescription: `${productName} keeps controls clear and avoids unnecessary decoration, focusing instead on stable use and intuitive operation.`,
    };
  }

  return {
    description: `${productName} brings practical ${categoryName} features to a clean everyday setup.`,
    detailedDescription: `Built for daily use, ${productName} balances reliable performance, simple setup, and a streamlined desk experience.`,
  };
};

async function seedHeroTranslations() {
  const heroes = await prisma.hero.findMany({
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      description: true,
      detailed_description: true,
      targetCategory: {
        select: {
          name_en: true,
          slug: true,
          translations: {
            where: { locale: 'en' },
            select: { name: true },
          },
        },
      },
    },
  });
  const heroIdByKey = new Map(heroes.map((hero) => [hero.name_en, hero.id]));
  const explicitTranslationKeys = new Set(
    heroTranslations.map(
      (translation) => `${translation.heroKey}:${translation.locale}`,
    ),
  );

  for (const translation of heroTranslations) {
    const heroId = heroIdByKey.get(translation.heroKey);

    if (!heroId) {
      console.warn(`Skipped HeroTranslation: ${translation.heroKey}`);
      continue;
    }

    await prisma.heroTranslation.upsert({
      where: {
        heroId_locale: {
          heroId,
          locale: translation.locale,
        },
      },
      update: {
        name: translation.name,
        description: translation.description ?? null,
        detailed_description: translation.detailed_description ?? null,
      },
      create: {
        heroId,
        locale: translation.locale,
        name: translation.name,
        description: translation.description ?? null,
        detailed_description: translation.detailed_description ?? null,
      },
    });
  }

  for (const hero of heroes) {
    const categoryName =
      hero.targetCategory?.translations[0]?.name ??
      (hero.targetCategory
        ? normalizeEnglishCategoryName(
            hero.targetCategory.name_en,
            hero.targetCategory.slug,
          )
        : null);
    const generatedTranslations = [
      {
        locale: 'ko',
        name: hero.name_ko,
        description: hero.description,
        detailed_description: hero.detailed_description,
      },
      {
        locale: 'en',
        name: categoryName ?? titleCaseFromSlug(hero.name_en),
        description: categoryName
          ? `Explore ${categoryName} products.`
          : hero.description,
        detailed_description: null,
      },
    ] as const;

    for (const translation of generatedTranslations) {
      if (explicitTranslationKeys.has(`${hero.name_en}:${translation.locale}`)) {
        continue;
      }

      await prisma.heroTranslation.upsert({
        where: {
          heroId_locale: {
            heroId: hero.id,
            locale: translation.locale,
          },
        },
        update: {
          name: translation.name,
          description: translation.description ?? null,
          detailed_description: translation.detailed_description ?? null,
        },
        create: {
          heroId: hero.id,
          locale: translation.locale,
          name: translation.name,
          description: translation.description ?? null,
          detailed_description: translation.detailed_description ?? null,
        },
      });
    }
  }
}

async function seedHomeSectionTranslations() {
  const sections = await prisma.homeSection.findMany({
    select: {
      id: true,
      key: true,
      eyebrow: true,
      title: true,
      subtitle: true,
    },
  });
  const sectionIdByKey = new Map(
    sections.map((section) => [section.key, section.id]),
  );

  for (const translation of homeSectionTranslations) {
    const sectionId = sectionIdByKey.get(translation.sectionKey);

    if (!sectionId) {
      console.warn(`Skipped HomeSectionTranslation: ${translation.sectionKey}`);
      continue;
    }

    await prisma.homeSectionTranslation.upsert({
      where: {
        sectionId_locale: {
          sectionId,
          locale: translation.locale,
        },
      },
      update: {
        eyebrow: translation.eyebrow ?? null,
        title: translation.title,
        subtitle: translation.subtitle ?? null,
      },
      create: {
        sectionId,
        locale: translation.locale,
        eyebrow: translation.eyebrow ?? null,
        title: translation.title,
        subtitle: translation.subtitle ?? null,
      },
    });
  }

  for (const section of sections) {
    await prisma.homeSectionTranslation.upsert({
      where: {
        sectionId_locale: {
          sectionId: section.id,
          locale: 'ko',
        },
      },
      update: {
        eyebrow: section.eyebrow,
        title: section.title,
        subtitle: section.subtitle,
      },
      create: {
        sectionId: section.id,
        locale: 'ko',
        eyebrow: section.eyebrow,
        title: section.title,
        subtitle: section.subtitle,
      },
    });
  }
}

async function seedHomeSectionItemTranslations() {
  const sections = await prisma.homeSection.findMany({
    select: {
      key: true,
      items: {
        select: {
          id: true,
          label: true,
          title: true,
          description: true,
          cta: true,
          imageAlt: true,
          targetCategory: { select: { slug: true } },
          targetProduct: { select: { slug: true } },
        },
      },
    },
  });
  const itemIdByKey = new Map<string, number>();

  sections.forEach((section) => {
    section.items.forEach((item) => {
      const itemKey = item.targetProduct?.slug ?? item.targetCategory?.slug;

      if (itemKey) {
        itemIdByKey.set(`${section.key}:${itemKey}`, item.id);
      }
    });
  });

  for (const translation of homeSectionItemTranslations) {
    const itemId = itemIdByKey.get(
      `${translation.sectionKey}:${translation.itemKey}`,
    );

    if (!itemId) {
      console.warn(
        `Skipped HomeSectionItemTranslation: ${translation.sectionKey}/${translation.itemKey}`,
      );
      continue;
    }

    await prisma.homeSectionItemTranslation.upsert({
      where: {
        itemId_locale: {
          itemId,
          locale: translation.locale,
        },
      },
      update: {
        label: translation.label ?? null,
        title: translation.title,
        description: translation.description ?? null,
        cta: translation.cta ?? null,
        imageAlt: translation.imageAlt ?? null,
      },
      create: {
        itemId,
        locale: translation.locale,
        label: translation.label ?? null,
        title: translation.title,
        description: translation.description ?? null,
        cta: translation.cta ?? null,
        imageAlt: translation.imageAlt ?? null,
      },
    });
  }

  for (const section of sections) {
    for (const item of section.items) {
      await prisma.homeSectionItemTranslation.upsert({
        where: {
          itemId_locale: {
            itemId: item.id,
            locale: 'ko',
          },
        },
        update: {
          label: item.label,
          title: item.title,
          description: item.description,
          cta: item.cta,
          imageAlt: item.imageAlt,
        },
        create: {
          itemId: item.id,
          locale: 'ko',
          label: item.label,
          title: item.title,
          description: item.description,
          cta: item.cta,
          imageAlt: item.imageAlt,
        },
      });
    }
  }
}

async function seedFilterTranslations() {
  const filters = await prisma.filter.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  for (const filter of filters) {
    const translations = [
      {
        locale: 'ko',
        name: filter.name,
      },
      {
        locale: 'en',
        name: filterEnglishNameByKorean[filter.name] ?? filter.name,
      },
    ];

    for (const translation of translations) {
      await prisma.filterTranslation.upsert({
        where: {
          filterId_locale: {
            filterId: filter.id,
            locale: translation.locale,
          },
        },
        update: {
          name: translation.name,
        },
        create: {
          filterId: filter.id,
          locale: translation.locale,
          name: translation.name,
        },
      });
    }
  }
}

async function seedFilterOptionTranslations() {
  const filterOptions = await prisma.filterOption.findMany({
    select: {
      id: true,
      name_ko: true,
      name_en: true,
    },
  });

  for (const option of filterOptions) {
    const translations = [
      {
        locale: 'ko',
        name: option.name_ko,
      },
      {
        locale: 'en',
        name: normalizeEnglishFilterOptionName(option.name_en),
      },
    ];

    for (const translation of translations) {
      await prisma.filterOptionTranslation.upsert({
        where: {
          filterOptionId_locale: {
            filterOptionId: option.id,
            locale: translation.locale,
          },
        },
        update: {
          name: translation.name,
        },
        create: {
          filterOptionId: option.id,
          locale: translation.locale,
          name: translation.name,
        },
      });
    }
  }
}

async function seedColorTranslations() {
  const colors = await prisma.color.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const translations = colors.flatMap((color) => [
    {
      colorId: color.id,
      locale: 'ko',
      name: color.name,
    },
    {
      colorId: color.id,
      locale: 'en',
      name: colorEnglishNameByKorean[color.name] ?? color.name,
    },
  ]);

  if (colors.length === 0) {
    return;
  }

  await prisma.$transaction([
    prisma.colorTranslation.deleteMany({
      where: {
        colorId: { in: colors.map((color) => color.id) },
      },
    }),
    prisma.colorTranslation.createMany({
      data: translations,
    }),
  ]);
}

async function seedProductCategoryTranslations() {
  const categories = await prisma.productCategory.findMany({
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      slug: true,
    },
  });

  for (const category of categories) {
    const translations = [
      {
        locale: 'ko',
        name: category.name_ko,
      },
      {
        locale: 'en',
        name: normalizeEnglishCategoryName(category.name_en, category.slug),
      },
    ];

    for (const translation of translations) {
      await prisma.productCategoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale: translation.locale,
          },
        },
        update: {
          name: translation.name,
        },
        create: {
          categoryId: category.id,
          locale: translation.locale,
          name: translation.name,
        },
      });
    }
  }
}

async function seedProductTranslations() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      description: true,
      detailed_description: true,
      note: true,
      category: {
        select: {
          name_en: true,
          slug: true,
        },
      },
    },
  });

  for (const product of products) {
    const normalizedCategoryName = normalizeEnglishCategoryName(
      product.category.name_en,
      product.category.slug,
    );
    const categoryName = getEnglishProductCategoryNoun(
      product.category.slug,
      normalizedCategoryName,
    );
    const englishCopy = getEnglishProductCopy({
      categoryName,
      productName: product.name_en,
      koreanDescription: product.description,
    });
    const translations = [
      {
        locale: 'ko',
        name: product.name_en,
        description: product.description,
        detailed_description: product.detailed_description,
        note: product.note,
      },
      {
        locale: 'en',
        name: product.name_en,
        description: englishCopy.description,
        detailed_description: englishCopy.detailedDescription,
        note: null,
      },
    ];

    for (const translation of translations) {
      await prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: product.id,
            locale: translation.locale,
          },
        },
        update: {
          name: translation.name,
          description: translation.description,
          detailed_description: translation.detailed_description,
          note: translation.note,
        },
        create: {
          productId: product.id,
          locale: translation.locale,
          name: translation.name,
          description: translation.description,
          detailed_description: translation.detailed_description,
          note: translation.note,
        },
      });
    }
  }
}

async function seedProductDetailTranslations() {
  const details = await prisma.productDetail.findMany({
    select: {
      id: true,
      title_middle: true,
      title_sub: true,
      specification: true,
      note: true,
    },
  });

  const detailIds = details.map((detail) => detail.id);
  const translations = details.flatMap((detail) => [
      {
        detailId: detail.id,
        locale: 'ko',
        title_middle: detail.title_middle,
        title_sub: detail.title_sub,
        specification: detail.specification,
        note: detail.note,
      },
      {
        detailId: detail.id,
        locale: 'en',
        title_middle: normalizeEnglishProductDetailTitle(
          detail.title_middle,
        ),
        title_sub: normalizeEnglishProductDetailTitle(detail.title_sub),
        specification: normalizeEnglishProductDetailSpecification(
          detail.specification,
        ),
        note: detail.note,
      },
    ]);

  if (detailIds.length === 0) {
    return;
  }

  await prisma.$transaction([
    prisma.productDetailTranslation.deleteMany({
      where: {
        detailId: { in: detailIds },
      },
    }),
    prisma.productDetailTranslation.createMany({
      data: translations,
    }),
  ]);
}

async function seedI18n() {
  await seedHeroTranslations();
  await seedHomeSectionTranslations();
  await seedHomeSectionItemTranslations();
  await seedProductCategoryTranslations();
  await seedProductTranslations();
  await seedProductDetailTranslations();
  await seedFilterTranslations();
  await seedFilterOptionTranslations();
  await seedColorTranslations();
}

seedI18n()
  .then(async () => {
    console.log('Synced i18n content translations.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('i18n content seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
