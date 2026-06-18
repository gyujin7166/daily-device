import { existsSync, readFileSync } from 'fs';
import path from 'path';

export type SeedImageManifestImage = {
  fileName: string;
  publicId: string;
  secureUrl: string;
  order: number;
  isMain: boolean;
};

export type SeedImageManifestProduct = {
  productSlug: string;
  categorySlug: string;
  colorName: string | null;
  colorSlug: string | null;
  images: SeedImageManifestImage[];
};

export type SeedImageManifestCategory = {
  categorySlug: string;
  image: SeedImageManifestImage;
};

export type SeedImageManifestHero = {
  heroType: string;
  heroKey: string;
  categorySlug: string | null;
  image: SeedImageManifestImage;
};

export type SeedImageManifestHomeItem = {
  sectionKey: string;
  itemKey: string;
  image: SeedImageManifestImage;
};

export type SeedImageManifest = {
  generatedAt: string;
  sourceRoot: string;
  cloudName: string;
  folderPrefix: string | null;
  products: SeedImageManifestProduct[];
  categories?: SeedImageManifestCategory[];
  heroes?: SeedImageManifestHero[];
  homeItems?: SeedImageManifestHomeItem[];
};

const DEFAULT_SEED_IMAGE_MANIFEST_PATH = path.resolve(
  process.cwd(),
  'prisma/seeds/data/seed-image-manifest.json',
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isManifestImage = (value: unknown): value is SeedImageManifestImage => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.fileName === 'string' &&
    typeof value.publicId === 'string' &&
    typeof value.secureUrl === 'string' &&
    typeof value.order === 'number' &&
    Number.isInteger(value.order) &&
    value.order >= 0 &&
    typeof value.isMain === 'boolean'
  );
};

const isManifestProduct = (
  value: unknown,
): value is SeedImageManifestProduct => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.productSlug === 'string' &&
    typeof value.categorySlug === 'string' &&
    (typeof value.colorName === 'string' || value.colorName === null) &&
    (typeof value.colorSlug === 'string' || value.colorSlug === null) &&
    Array.isArray(value.images) &&
    value.images.every(isManifestImage)
  );
};

const isManifestCategory = (
  value: unknown,
): value is SeedImageManifestCategory => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.categorySlug === 'string' && isManifestImage(value.image);
};

const isManifestHero = (value: unknown): value is SeedImageManifestHero => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.heroType === 'string' &&
    typeof value.heroKey === 'string' &&
    (typeof value.categorySlug === 'string' || value.categorySlug === null) &&
    isManifestImage(value.image)
  );
};

const isManifestHomeItem = (
  value: unknown,
): value is SeedImageManifestHomeItem => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.sectionKey === 'string' &&
    typeof value.itemKey === 'string' &&
    isManifestImage(value.image)
  );
};

const isSeedImageManifest = (value: unknown): value is SeedImageManifest => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.generatedAt === 'string' &&
    typeof value.sourceRoot === 'string' &&
    typeof value.cloudName === 'string' &&
    (typeof value.folderPrefix === 'string' || value.folderPrefix === null) &&
    Array.isArray(value.products) &&
    value.products.every(isManifestProduct) &&
    (value.categories === undefined ||
      (Array.isArray(value.categories) &&
        value.categories.every(isManifestCategory))) &&
    (value.heroes === undefined ||
      (Array.isArray(value.heroes) && value.heroes.every(isManifestHero))) &&
    (value.homeItems === undefined ||
      (Array.isArray(value.homeItems) &&
        value.homeItems.every(isManifestHomeItem)))
  );
};

export const getSeedImageManifestPath = () =>
  path.resolve(
    process.cwd(),
    process.env.SEED_IMAGE_MANIFEST_PATH ?? DEFAULT_SEED_IMAGE_MANIFEST_PATH,
  );

export const readSeedImageManifest = () => {
  const manifestPath = getSeedImageManifestPath();

  if (!existsSync(manifestPath)) {
    return null;
  }

  const parsed: unknown = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  if (!isSeedImageManifest(parsed)) {
    throw new Error(`Invalid seed image manifest: ${manifestPath}`);
  }

  return parsed;
};
