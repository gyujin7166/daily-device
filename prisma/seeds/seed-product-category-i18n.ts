import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

const categoryEnglishNameBySlug: Record<string, string> = {
  accessories: 'Accessories',
  'audio-microphones': 'Audio & Microphones',
  'cameras-streaming': 'Cameras & Streaming',
  'mice-keyboards': 'Mice & Keyboards',
  'speakers-smart-home': 'Speakers & Smart Home',
};

const titleCaseFromSlug = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

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

async function seedProductCategoryI18n() {
  const categories = await prisma.productCategory.findMany({
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      slug: true,
    },
  });

  const translations = categories.flatMap((category) => [
    {
      categoryId: category.id,
      locale: 'ko',
      name: category.name_ko,
    },
    {
      categoryId: category.id,
      locale: 'en',
      name: normalizeEnglishCategoryName(category.name_en, category.slug),
    },
  ]);

  await prisma.$transaction([
    prisma.productCategoryTranslation.deleteMany({
      where: {
        categoryId: { in: categories.map((category) => category.id) },
      },
    }),
    prisma.productCategoryTranslation.createMany({
      data: translations,
    }),
  ]);

  console.log(`Synced ProductCategory translations: ${categories.length}`);
}

seedProductCategoryI18n()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('ProductCategory i18n seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
