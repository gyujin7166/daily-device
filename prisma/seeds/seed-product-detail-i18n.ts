import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

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
  구성품: 'Included items',
  길이: 'Length',
  깊이: 'Depth',
  너비: 'Width',
  높이: 'Height',
  두께: 'Thickness',
  무게: 'Weight',
  지원: 'Support',
  호환성: 'Compatibility',
  기술사양: 'Technical specifications',
  주요기능: 'Key features',
  제품크기: 'Product dimensions',
  케이스너비: 'Case width',
  케이스높이: 'Case height',
  위성스피커높이: 'Satellite speaker height',
  '기술 사양': 'Technical specifications',
  '주요 기능': 'Key features',
  '제품 크기': 'Product dimensions',
  '케이스 너비': 'Case width',
  '케이스 높이': 'Case height',
  '위성 스피커 높이': 'Satellite speaker height',
};

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
          return (
            productDetailEnglishSpecByKorean[item] ??
            productDetailEnglishSpecByKorean[compactKoreanKey(item)] ??
            item
          );
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

async function seedProductDetailI18n() {
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
      title_middle: normalizeEnglishProductDetailTitle(detail.title_middle),
      title_sub: normalizeEnglishProductDetailTitle(detail.title_sub),
      specification: normalizeEnglishProductDetailSpecification(
        detail.specification,
      ),
      note: detail.note,
    },
  ]);

  if (detailIds.length === 0) {
    console.log('No ProductDetail rows found.');
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

  console.log(`Synced ProductDetail translations: ${details.length}`);
}

seedProductDetailI18n()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('ProductDetail i18n seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
