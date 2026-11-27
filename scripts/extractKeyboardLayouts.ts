/**
 * Asks Gemini for the key layout of each keyboard, from its main image and
 * text, and saves the answers to a JSON file for review. It only reads the
 * database in .env.local and never writes to it.
 *
 *   npm run ai:extract:keyboard-layouts
 *   npm run ai:extract:keyboard-layouts -- --limit=3
 *   npm run ai:extract:keyboard-layouts -- --only=aster-keys-mini,nova-keys-air
 *   npm run ai:extract:keyboard-layouts -- --force
 *
 * Products already in the file are skipped unless --force is given, so a run
 * stopped by the free-tier rate limit can be resumed, and corrected entries
 * are not overwritten. Each analyzed product costs one Gemini request.
 */
import '../prisma/seeds/load-env';

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import prisma from '../prisma/prismaClientSingleton';
import { GeminiError } from '../src/shared/lib/gemini/geminiError';
import { generateGeminiStructuredOutput } from '../src/shared/lib/gemini/generateGeminiText';
import { getCloudinaryImageUrl } from '../src/shared/lib/utils/cloudinaryImage';

import type { Interactions } from '@google/genai';

const CATEGORY_SLUG = 'keyboards';
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../prisma/seeds/data/keyboard-layouts.json',
);
// Stays under 10 requests a minute, below the free-tier limit of Flash models.
const REQUEST_INTERVAL_MS = 6500;

// Layouts the user has checked by hand, to measure accuracy.
const EXPECTED_LAYOUTS_BY_NAME: Record<string, KeyboardLayout> = {
  'Aster Keys Mini': '65-percent',
  'Nova Keys Air': 'full-size',
  'Lumen Keys Slim': 'full-size',
};

const keyboardLayoutSchema = z.enum([
  'full-size',
  'tenkeyless',
  '75-percent',
  '65-percent',
  '60-percent',
  'unknown',
]);

type KeyboardLayout = z.infer<typeof keyboardLayoutSchema>;

const layoutAnswerSchema = z.object({
  layout: keyboardLayoutSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  evidence: z
    .string()
    .describe('One or two Korean sentences naming what was seen or read.'),
});

type LayoutEntry = z.infer<typeof layoutAnswerSchema> & {
  name: string;
  imageUsed: boolean;
  model: string;
  analyzedAt: string;
  // Set to true by hand after checking the entry.
  reviewed: boolean;
};

type LayoutFile = {
  category: string;
  products: Record<string, LayoutEntry>;
};

type KeyboardProduct = Awaited<ReturnType<typeof findKeyboards>>[number];

const PROMPT = `You classify the physical key layout of one keyboard sold in a shop.

Layouts:
- full-size: separate number pad on the right (about 100-108 keys).
- tenkeyless: no number pad, but a separate navigation block (Insert/Home/Page Up) and arrow keys with a gap from the main keys.
- 75-percent: no number pad and no separate navigation block; the function row and arrow keys are packed tightly against the main keys.
- 65-percent: no function row, arrow keys and a single column of navigation keys on the right.
- 60-percent: no function row and no dedicated arrow keys.
- unknown: the image and text do not show enough to decide.

Rules:
- Decide mainly from the image. Count what you can see: number pad, function row, arrow keys, navigation block.
- Use the text only when it states the layout or says whether there is a number pad. Product names such as "Mini" or "Slim" are not proof.
- If the image shows only part of the keyboard, is a lifestyle shot or shows a different product, and the text does not decide it, answer unknown.
- confidence is high only when the number pad and arrow area are both clearly visible.
- Write evidence in Korean.`;

function parseArgs(argv: string[]) {
  const getValue = (name: string) =>
    argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
  const limit = Number(getValue('limit'));
  const only = getValue('only')
    ?.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return {
    limit: Number.isInteger(limit) && limit > 0 ? limit : undefined,
    only: only && only.length > 0 ? only : undefined,
    force: argv.includes('--force'),
  };
}

function findKeyboards() {
  return prisma.product.findMany({
    where: { category: { slug: CATEGORY_SLUG } },
    orderBy: { id: 'asc' },
    select: {
      slug: true,
      name_en: true,
      name_ko: true,
      description: true,
      detailed_description: true,
      ProductImage: {
        orderBy: [{ isMain: 'desc' }, { order: 'asc' }],
        take: 1,
        select: { image_url: true },
      },
      productDetail: {
        select: { title_middle: true, title_sub: true, specification: true },
      },
    },
  });
}

async function readLayoutFile(): Promise<LayoutFile> {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, 'utf8')) as LayoutFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { category: CATEGORY_SLUG, products: {} };
    }

    throw error;
  }
}

async function writeLayoutFile(file: LayoutFile) {
  const products = Object.fromEntries(
    Object.entries(file.products).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );

  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify({ ...file, products }, null, 2)}\n`,
  );
}

async function fetchImage(
  imageUrl: string,
): Promise<Interactions.Content | null> {
  const response = await fetch(
    getCloudinaryImageUrl(imageUrl, 'productDetail'),
  );
  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';

  if (!response.ok || !mimeType.startsWith('image/')) {
    console.warn(`  Image skipped (${response.status} ${mimeType}).`);
    return null;
  }

  const data = Buffer.from(await response.arrayBuffer()).toString('base64');

  return { type: 'image', data, mime_type: mimeType };
}

function describeProduct(product: KeyboardProduct) {
  const details = product.productDetail
    .map(({ title_middle, title_sub, specification }) =>
      [title_middle, title_sub, specification].filter(Boolean).join(' / '),
    )
    .filter(Boolean);

  return JSON.stringify({
    name: product.name_en,
    name_ko: product.name_ko,
    description: product.description,
    detailed_description: product.detailed_description,
    specifications: details,
  });
}

async function analyzeProduct(product: KeyboardProduct) {
  const imageUrl = product.ProductImage[0]?.image_url;
  const image = imageUrl ? await fetchImage(imageUrl) : null;
  const input: Interactions.Content[] = [
    {
      type: 'text',
      text: `${PROMPT}\n\nProduct text (JSON):\n${describeProduct(product)}`,
    },
    ...(image ? [image] : []),
  ];
  const answer = await generateGeminiStructuredOutput(
    input,
    layoutAnswerSchema,
    { thinkingLevel: 'low' },
  );

  return { answer, imageUsed: image !== null };
}

function printAccuracy(file: LayoutFile) {
  const entries = Object.values(file.products);
  const checks = Object.entries(EXPECTED_LAYOUTS_BY_NAME).flatMap(
    ([name, expected]) => {
      const entry = entries.find((item) => item.name === name);
      return entry ? [{ name, expected, actual: entry.layout }] : [];
    },
  );

  if (checks.length === 0) {
    return;
  }

  console.log('\nKnown layouts:');
  checks.forEach(({ name, expected, actual }) => {
    const mark = expected === actual ? 'OK  ' : 'MISS';
    console.log(`  ${mark} ${name}: expected ${expected}, got ${actual}`);
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { limit, only, force } = parseArgs(process.argv.slice(2));
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const file = await readLayoutFile();
  const keyboards = (await findKeyboards()).filter(
    (product) =>
      !only ||
      only.includes(product.slug.toLowerCase()) ||
      only.includes(product.name_en.toLowerCase()),
  );
  const pending = keyboards
    .filter((product) => force || !file.products[product.slug])
    .slice(0, limit);

  console.log(
    `${keyboards.length} keyboards found, ${pending.length} to analyze with ${model}.`,
  );

  for (const [index, product] of pending.entries()) {
    if (index > 0) {
      await sleep(REQUEST_INTERVAL_MS);
    }

    console.log(`[${index + 1}/${pending.length}] ${product.name_en}`);

    try {
      const { answer, imageUsed } = await analyzeProduct(product);
      file.products[product.slug] = {
        name: product.name_en,
        ...answer,
        imageUsed,
        model,
        analyzedAt: new Date().toISOString(),
        reviewed: false,
      };
      // Save after each product so a stopped run keeps its results.
      await writeLayoutFile(file);
      console.log(
        `  ${answer.layout} (${answer.confidence}) ${answer.evidence}`,
      );
    } catch (error) {
      if (error instanceof GeminiError && error.status === 429) {
        console.error('  Rate limit reached. Run again later to continue.');
        break;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.error(`  Failed: ${message}`);
      process.exitCode = 1;
    }
  }

  printAccuracy(file);
  console.log(`\nSaved to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
