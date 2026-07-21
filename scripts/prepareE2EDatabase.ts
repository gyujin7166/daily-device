import { spawnSync } from 'node:child_process';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

import { isE2ESeedDataReady } from './e2eDatabaseSeed';
import { requireE2EDatabaseUrl } from './e2eDatabaseUrl';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

type Command = {
  args: string[];
  label: string;
};

const prismaCliPath = require.resolve('prisma/build/index.js');
const tsNodeCliPath = require.resolve('ts-node/dist/bin.js');

const schemaCommand: Command = {
  args: [prismaCliPath, 'db', 'push', '--skip-generate'],
  label: 'Synchronizing the E2E database schema',
};
const seedCommands: Command[] = [
  {
    args: [tsNodeCliPath, 'prisma/seeds/seeds.ts'],
    label: 'Synchronizing the E2E catalog seed data',
  },
  {
    args: [tsNodeCliPath, 'prisma/seeds/seed-i18n.ts'],
    label: 'Synchronizing the E2E i18n seed data',
  },
];

function runCommand(command: Command, env: NodeJS.ProcessEnv) {
  console.log(`${command.label}...`);

  const result = spawnSync(process.execPath, command.args, {
    env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command.label} failed with exit code ${result.status ?? 'unknown'}.`,
    );
  }
}

async function hasRequiredSeedData(databaseUrl: string) {
  const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

  try {
    const [
      categories,
      categoryTranslations,
      colors,
      colorTranslations,
      filterOptions,
      filterOptionTranslations,
      filters,
      filterTranslations,
      heroes,
      heroTranslations,
      homeSectionItems,
      homeSectionItemTranslations,
      homeSections,
      homeSectionTranslations,
      productDetails,
      productDetailTranslations,
      productImages,
      products,
      productTranslations,
    ] = await Promise.all([
      prisma.productCategory.count(),
      prisma.productCategoryTranslation.count(),
      prisma.color.count(),
      prisma.colorTranslation.count(),
      prisma.filterOption.count(),
      prisma.filterOptionTranslation.count(),
      prisma.filter.count(),
      prisma.filterTranslation.count(),
      prisma.hero.count(),
      prisma.heroTranslation.count(),
      prisma.homeSectionItem.count(),
      prisma.homeSectionItemTranslation.count(),
      prisma.homeSection.count(),
      prisma.homeSectionTranslation.count(),
      prisma.productDetail.count(),
      prisma.productDetailTranslation.count(),
      prisma.productImage.count(),
      prisma.product.count(),
      prisma.productTranslation.count(),
    ]);

    return isE2ESeedDataReady({
      categories,
      categoryTranslations,
      colors,
      colorTranslations,
      filterOptions,
      filterOptionTranslations,
      filters,
      filterTranslations,
      heroes,
      heroTranslations,
      homeSectionItems,
      homeSectionItemTranslations,
      homeSections,
      homeSectionTranslations,
      productDetails,
      productDetailTranslations,
      productImages,
      products,
      productTranslations,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function prepareE2EDatabase() {
  const databaseUrl = requireE2EDatabaseUrl(
    process.env.PLAYWRIGHT_DATABASE_URL,
  );
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DATABASE_CONNECTION_MODE: 'direct',
  };

  runCommand(schemaCommand, env);

  if (await hasRequiredSeedData(databaseUrl)) {
    console.log('Required E2E seed data is already available.');
    return;
  }

  for (const command of seedCommands) {
    runCommand(command, env);
  }
}

prepareE2EDatabase()
  .then(() => {
    console.log('E2E database preparation completed.');
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error(`E2E database preparation failed: ${message}`);
    process.exitCode = 1;
  });
