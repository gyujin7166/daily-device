import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recommends = [
  { name: '프리미엄 생산성 제품' },
  { name: '비즈니스 추천 제품' },
  { name: '홈 오피스 셋업' },
  { name: '인체공학 제품군' },
];

export async function createRecommend() {
  try {
    await prisma.recommend.deleteMany();

    const res = await prisma.recommend.createMany({
      data: recommends,
    });

    console.log('Synced Recommends: ', res);
  } catch (error) {
    console.log('Create Recommends failed!: ', error);
    throw error;
  }
}
