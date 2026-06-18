import './load-env';

import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { fal } from '@fal-ai/client';

const SOURCE_ROOT = path.resolve(
  process.env.SEED_IMAGE_ROOT ?? path.join(process.cwd(), '.seed-images'),
);
const OUTPUT_ROOT = path.resolve(
  process.env.SEED_TRANSPARENT_IMAGE_ROOT ??
    path.join(process.cwd(), '.seed-images-transparent'),
);
const MODEL_ID = 'fal-ai/birefnet/v2';
const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
]);
const IMAGE_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

type FalImageFile = {
  url: string;
  content_type?: string;
  file_name?: string;
  width?: number;
  height?: number;
};

type BirefnetResult = {
  image?: FalImageFile;
};

type ImageJob = {
  sourcePath: string;
  outputPath: string;
  relativePath: string;
};

const shouldForce = process.argv.includes('--force');

const isImageFile = (filePath: string) =>
  IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());

const fileExists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const getOutputPath = (sourcePath: string) => {
  const relativePath = path.relative(SOURCE_ROOT, sourcePath);
  const parsedPath = path.parse(relativePath);
  const outputRelativePath = path.join(
    parsedPath.dir,
    `${parsedPath.name}.webp`,
  );

  return {
    outputPath: path.join(OUTPUT_ROOT, outputRelativePath),
    relativePath,
  };
};

const collectImageJobs = async (directoryPath: string): Promise<ImageJob[]> => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const jobs: ImageJob[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      jobs.push(...(await collectImageJobs(entryPath)));
      continue;
    }

    if (!entry.isFile() || !isImageFile(entryPath)) {
      continue;
    }

    const { outputPath, relativePath } = getOutputPath(entryPath);

    jobs.push({
      sourcePath: entryPath,
      outputPath,
      relativePath,
    });
  }

  return jobs.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath, 'en'),
  );
};

const downloadFile = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download processed image: ${response.status} ${response.statusText}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
};

const removeBackground = async (job: ImageJob) => {
  const sourceBuffer = await readFile(job.sourcePath);
  const extension = path.extname(job.sourcePath).toLowerCase();
  const file = new Blob([new Uint8Array(sourceBuffer)], {
    type: IMAGE_MIME_TYPES[extension] ?? 'application/octet-stream',
  });
  const imageUrl = await fal.storage.upload(file, {
    lifecycle: { expiresIn: '1d' },
  });
  const result = (await fal.subscribe(MODEL_ID, {
    input: {
      image_url: imageUrl,
      model: 'General Use (Light)',
      operating_resolution: '1024x1024',
      refine_foreground: true,
      output_format: 'webp',
    },
  })) as { data: BirefnetResult; requestId: string };
  const outputUrl = result.data.image?.url;

  if (!outputUrl) {
    throw new Error(`fal response does not include an output image URL.`);
  }

  const outputBuffer = await downloadFile(outputUrl);

  await mkdir(path.dirname(job.outputPath), { recursive: true });
  await writeFile(job.outputPath, outputBuffer);

  console.log(
    `Processed ${job.relativePath} -> ${path.relative(process.cwd(), job.outputPath)}`,
  );
};

const removeBackgroundSeedImages = async () => {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required to call fal.ai.');
  }

  const jobs = await collectImageJobs(SOURCE_ROOT);
  let processedCount = 0;

  await mkdir(OUTPUT_ROOT, { recursive: true });

  console.log(`Source root: ${SOURCE_ROOT}`);
  console.log(`Output root: ${OUTPUT_ROOT}`);
  console.log(`Found images: ${jobs.length}`);

  for (const [index, job] of jobs.entries()) {
    if (!shouldForce && (await fileExists(job.outputPath))) {
      console.log(`Skipped ${job.relativePath} (${index + 1}/${jobs.length})`);
      continue;
    }

    console.log(`Processing ${job.relativePath} (${index + 1}/${jobs.length})`);
    await removeBackground(job);
    processedCount += 1;
  }

  console.log(`Created transparent webp images: ${processedCount}`);
};

removeBackgroundSeedImages().catch((error) => {
  console.error('Remove background seed images failed:', error);
  process.exit(1);
});
