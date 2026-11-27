/**
 * Adds the keyboard "배열" (layout) filter to the database in DATABASE_URL and
 * links each keyboard to its reviewed layout from keyboard-layouts.json.
 * Without --apply it only prints what would change.
 *
 *   npm run db:apply:keyboard-layouts
 *   npm run db:apply:keyboard-layouts -- --apply
 *
 * Running it again gives the same result, so it is safe to use on both the
 * development and the production database.
 */
import './load-env';

import { PrismaClient } from '@prisma/client';

import { keyboardLayoutFilter } from './data/filter-catalog';
import {
  getReviewedKeyboardLayout,
  getReviewedKeyboardLayoutSlugs,
} from './data/reviewed-keyboard-layouts';

const CATEGORY_NAME = 'keyboards';
// Same names as the maps in seed-i18n.ts.
const FILTER_NAME_EN = 'Layout';
const OPTION_NAME_EN: Record<string, string> = {
  'full-size': 'Full-size',
  tenkeyless: 'Tenkeyless',
  '65-percent': '65%',
};

const prisma = new PrismaClient();

const getDatabaseLabel = () => {
  try {
    const url = new URL(process.env.DATABASE_URL ?? '');
    return `${url.hostname}${url.pathname}`;
  } catch {
    return 'unknown database';
  }
};

async function readCurrentState() {
  const [products, filter] = await Promise.all([
    prisma.product.findMany({
      where: { category: { slug: CATEGORY_NAME } },
      orderBy: { slug: 'asc' },
      select: { id: true, slug: true },
    }),
    prisma.filter.findFirst({
      where: { categoryName: CATEGORY_NAME, name: keyboardLayoutFilter.name },
      select: {
        id: true,
        filterOption: {
          select: {
            id: true,
            name_en: true,
            ProductFilterOption: { select: { productId: true } },
          },
        },
      },
    }),
  ]);

  return { products, filter };
}

function printPlan({
  products,
  filter,
}: Awaited<ReturnType<typeof readCurrentState>>) {
  const currentLayoutByProductId = new Map<number, string[]>();
  filter?.filterOption.forEach(({ name_en, ProductFilterOption }) => {
    ProductFilterOption.forEach(({ productId }) => {
      currentLayoutByProductId.set(productId, [
        ...(currentLayoutByProductId.get(productId) ?? []),
        name_en,
      ]);
    });
  });

  const existingOptions = new Set(
    filter?.filterOption.map(({ name_en }) => name_en),
  );
  const missingOptions = keyboardLayoutFilter.options.filter(
    ({ name_en }) => !existingOptions.has(name_en),
  );

  console.log(`Database: ${getDatabaseLabel()}`);
  console.log(
    filter
      ? `Filter "${keyboardLayoutFilter.name}" exists (id ${filter.id}).`
      : `Filter "${keyboardLayoutFilter.name}" will be created.`,
  );
  missingOptions.forEach(({ name_ko, name_en }) => {
    console.log(`Option will be created: ${name_ko} (${name_en})`);
  });

  let changes = 0;
  console.log('\nProducts:');
  products.forEach(({ id, slug }) => {
    const current = (currentLayoutByProductId.get(id) ?? []).join(', ') || '-';
    const next = getReviewedKeyboardLayout(slug) ?? '-';
    const changed = current !== next;
    changes += changed ? 1 : 0;
    console.log(`  ${changed ? '*' : ' '} ${slug}: ${current} -> ${next}`);
  });

  const productSlugs = new Set(products.map(({ slug }) => slug));
  getReviewedKeyboardLayoutSlugs()
    .filter((slug) => !productSlugs.has(slug))
    .forEach((slug) => {
      console.warn(`  Not in this database, skipped: ${slug}`);
    });

  console.log(`\n${changes} product(s) will change.`);
}

async function applyLayouts() {
  await prisma.$transaction(async (tx) => {
    const filter =
      (await tx.filter.findFirst({
        where: { categoryName: CATEGORY_NAME, name: keyboardLayoutFilter.name },
        select: { id: true },
      })) ??
      (await tx.filter.create({
        data: { categoryName: CATEGORY_NAME, name: keyboardLayoutFilter.name },
        select: { id: true },
      }));

    for (const locale of ['ko', 'en']) {
      const name = locale === 'ko' ? keyboardLayoutFilter.name : FILTER_NAME_EN;
      await tx.filterTranslation.upsert({
        where: { filterId_locale: { filterId: filter.id, locale } },
        update: { name },
        create: { filterId: filter.id, locale, name },
      });
    }

    const optionIdByName = new Map<string, number>();
    for (const { name_ko, name_en } of keyboardLayoutFilter.options) {
      const option =
        (await tx.filterOption.findFirst({
          where: { filterId: filter.id, name_en },
          select: { id: true },
        })) ??
        (await tx.filterOption.create({
          data: {
            filterId: filter.id,
            categoryName: CATEGORY_NAME,
            name_ko,
            name_en,
          },
          select: { id: true },
        }));
      optionIdByName.set(name_en, option.id);

      for (const locale of ['ko', 'en']) {
        const name = locale === 'ko' ? name_ko : OPTION_NAME_EN[name_en];
        await tx.filterOptionTranslation.upsert({
          where: {
            filterOptionId_locale: { filterOptionId: option.id, locale },
          },
          update: { name },
          create: { filterOptionId: option.id, locale, name },
        });
      }
    }

    const products = await tx.product.findMany({
      where: { category: { slug: CATEGORY_NAME } },
      select: { id: true, slug: true },
    });

    await tx.productFilterOption.deleteMany({
      where: { filterOption: { filterId: filter.id } },
    });

    const links = products.flatMap(({ id, slug }) => {
      const layout = getReviewedKeyboardLayout(slug);
      const filterOptionId = layout ? optionIdByName.get(layout) : undefined;

      if (layout && !filterOptionId) {
        throw new Error(`Unknown layout "${layout}" for ${slug}`);
      }

      return filterOptionId ? [{ productId: id, filterOptionId }] : [];
    });

    await tx.productFilterOption.createMany({ data: links });
    console.log(`Linked ${links.length} keyboard(s) to a layout.`);
  });
}

async function main() {
  const shouldApply = process.argv.includes('--apply');

  printPlan(await readCurrentState());

  if (!shouldApply) {
    console.log('Dry run: nothing was written. Add --apply to write.');
    return;
  }

  await applyLayouts();
  console.log('Applied.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
