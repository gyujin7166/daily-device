import { spawnSync } from 'node:child_process';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

import {
  isE2ESeedDataReady,
  readE2ESeedDataCounts,
  retryE2EDatabaseOperation,
} from './e2eDatabaseSeed';
import { requireE2EDatabaseUrl } from './e2eDatabaseUrl';

import type { E2ESeedDataCountReaders } from './e2eDatabaseSeed';

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
  return retryE2EDatabaseOperation(
    async () => {
      const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
      const readers: E2ESeedDataCountReaders = {
        categories: () => prisma.productCategory.count(),
        categoryTranslations: () => prisma.productCategoryTranslation.count(),
        colors: () => prisma.color.count(),
        colorTranslations: () => prisma.colorTranslation.count(),
        filterOptions: () => prisma.filterOption.count(),
        filterOptionTranslations: () => prisma.filterOptionTranslation.count(),
        filters: () => prisma.filter.count(),
        filterTranslations: () => prisma.filterTranslation.count(),
        heroes: () => prisma.hero.count(),
        heroTranslations: () => prisma.heroTranslation.count(),
        homeSectionItems: () => prisma.homeSectionItem.count(),
        homeSectionItemTranslations: () =>
          prisma.homeSectionItemTranslation.count(),
        homeSections: () => prisma.homeSection.count(),
        homeSectionTranslations: () => prisma.homeSectionTranslation.count(),
        productDetails: () => prisma.productDetail.count(),
        productDetailTranslations: () =>
          prisma.productDetailTranslation.count(),
        productImages: () => prisma.productImage.count(),
        products: () => prisma.product.count(),
        productTranslations: () => prisma.productTranslation.count(),
      };

      try {
        await prisma.$connect();
        const counts = await readE2ESeedDataCounts(readers);

        return isE2ESeedDataReady(counts);
      } finally {
        await prisma.$disconnect();
      }
    },
    {
      maxAttempts: 3,
      retryDelayMs: 1_000,
      onRetry: (nextAttempt, delayMs) => {
        console.warn(
          `E2E seed readiness check failed. Retrying attempt ${nextAttempt}/3 in ${delayMs}ms.`,
        );
      },
    },
  );
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
