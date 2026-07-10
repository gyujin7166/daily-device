import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

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

async function seedColorI18n() {
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

  console.log(`Synced Color translations: ${colors.length}`);
}

seedColorI18n()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Color i18n seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
