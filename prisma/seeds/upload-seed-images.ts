import './load-env';

import { createHash } from 'crypto';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { homeSections } from './data/home-catalog';
import {
  portfolioProductCategories,
  portfolioProducts,
} from './data/portfolio-catalog';
import {
  getSeedImageManifestPath,
  readSeedImageManifest,
} from './data/seed-image-manifest-utils';

import type {
  SeedImageManifest,
  SeedImageManifestCategory,
  SeedImageManifestHero,
  SeedImageManifestHomeItem,
  SeedImageManifestImage,
  SeedImageManifestProduct,
} from './data/seed-image-manifest-utils';

type ProductSeed = (typeof portfolioProducts)[number];
type CategorySeed = (typeof portfolioProductCategories)[number];

type ProductImageGroup = {
  colorName: string | null;
  colorSlug: string | null;
  files: string[];
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

type UploadTarget = 'all' | 'products' | 'categories' | 'heroes' | 'home';

type UploadOptions = {
  sourceRoot: string;
  target: UploadTarget;
  homeSectionKey?: string;
  homeItemKey?: string;
};

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
const MAX_DIRECTORY_DEPTH = 10;
const UPLOAD_TARGETS = new Set<UploadTarget>([
  'all',
  'products',
  'categories',
  'heroes',
  'home',
]);
const PRODUCT_ALL_HERO_KEY = 'products';
const PRODUCT_DISCOUNTS_HERO_KEY = 'discounts';
const colorSlugMap: Record<string, string> = {
  그래파이트: 'graphite',
  오프화이트: 'off-white',
  페일그레이: 'pale-gray',
  로즈핑크: 'rose-pink',
  블루: 'blue',
  레드: 'red',
  샌드베이지: 'sand-beige',
  라일락: 'lilac',
  세이지그린: 'sage-green',
};
const colorNameBySlug = Object.entries(colorSlugMap).reduce<
  Record<string, string>
>((acc, [colorName, colorSlug]) => {
  acc[colorSlug] = colorName;
  return acc;
}, {});

const toCloudinarySlug = (value: string, fallback = 'image') => {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
};

const getFileNameSlug = (filePath: string) =>
  toCloudinarySlug(path.basename(filePath, path.extname(filePath)), 'image');

const parseUploadTarget = (value: string): UploadTarget => {
  if (UPLOAD_TARGETS.has(value as UploadTarget)) {
    return value as UploadTarget;
  }

  throw new Error(
    `Invalid upload target: ${value}. Use one of ${Array.from(UPLOAD_TARGETS).join(', ')}.`,
  );
};

const parseUploadArgs = (argv: string[]): UploadOptions => {
  let sourceRootArg: string | undefined;
  let target: UploadTarget = 'all';
  let homeSectionKey: string | undefined;
  let homeItemKey: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith('--target=')) {
      target = parseUploadTarget(arg.slice('--target='.length));
      continue;
    }

    if (arg === '--target') {
      const nextArg = argv[index + 1];

      if (!nextArg) {
        throw new Error('Missing value for --target.');
      }

      target = parseUploadTarget(nextArg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--sectionKey=')) {
      homeSectionKey = arg.slice('--sectionKey='.length);
      continue;
    }

    if (arg.startsWith('--section-key=')) {
      homeSectionKey = arg.slice('--section-key='.length);
      continue;
    }

    if (arg === '--sectionKey' || arg === '--section-key') {
      const nextArg = argv[index + 1];

      if (!nextArg) {
        throw new Error(`Missing value for ${arg}.`);
      }

      homeSectionKey = nextArg;
      index += 1;
      continue;
    }

    if (arg.startsWith('--itemKey=')) {
      homeItemKey = arg.slice('--itemKey='.length);
      continue;
    }

    if (arg.startsWith('--item-key=')) {
      homeItemKey = arg.slice('--item-key='.length);
      continue;
    }

    if (arg === '--itemKey' || arg === '--item-key') {
      const nextArg = argv[index + 1];

      if (!nextArg) {
        throw new Error(`Missing value for ${arg}.`);
      }

      homeItemKey = nextArg;
      index += 1;
      continue;
    }

    if (arg.startsWith('--sourceRoot=')) {
      sourceRootArg = arg.slice('--sourceRoot='.length);
      continue;
    }

    if (arg.startsWith('--source-root=')) {
      sourceRootArg = arg.slice('--source-root='.length);
      continue;
    }

    if (arg === '--sourceRoot' || arg === '--source-root') {
      const nextArg = argv[index + 1];

      if (!nextArg) {
        throw new Error(`Missing value for ${arg}.`);
      }

      sourceRootArg = nextArg;
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!sourceRootArg) {
      sourceRootArg = arg;
      continue;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  if ((homeSectionKey || homeItemKey) && target !== 'home') {
    throw new Error(
      'Home item filters require --target home to avoid unintended uploads.',
    );
  }

  return {
    sourceRoot: path.resolve(
      process.cwd(),
      sourceRootArg ?? process.env.SEED_IMAGE_ROOT ?? '.seed-images',
    ),
    target,
    homeSectionKey,
    homeItemKey,
  };
};

const shouldUploadProducts = (target: UploadTarget) =>
  target === 'all' || target === 'products';

const shouldUploadCategories = (target: UploadTarget) =>
  target === 'all' || target === 'categories';

const shouldUploadHeroes = (target: UploadTarget) =>
  target === 'all' || target === 'heroes';

const shouldUploadHomeItems = (target: UploadTarget) =>
  target === 'all' || target === 'home';

const isMatchingHomeItem = (
  item: SeedImageManifestHomeItem,
  sectionKey?: string,
  itemKey?: string,
) =>
  (!sectionKey || item.sectionKey === sectionKey) &&
  (!itemKey || item.itemKey === itemKey);

const getCloudinaryApiSecret = () => {
  if (process.env.CLOUDINARY_API_SECRET) {
    return process.env.CLOUDINARY_API_SECRET;
  }

  if (!process.env.CLOUDINARY_URL) {
    return null;
  }

  return decodeURIComponent(new URL(process.env.CLOUDINARY_URL).password);
};

const getCloudinaryApiKey = () => {
  if (process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    return process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  }

  if (!process.env.CLOUDINARY_URL) {
    return null;
  }

  return decodeURIComponent(new URL(process.env.CLOUDINARY_URL).username);
};

const getCloudinaryCloudName = () => {
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  }

  if (!process.env.CLOUDINARY_URL) {
    return null;
  }

  return new URL(process.env.CLOUDINARY_URL).hostname;
};

const getProductUploadPreset = () =>
  process.env.NEXT_PUBLIC_CLOUDINARY_PRODUCT_UPLOAD_PRESET ??
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
  '';

const getFolderPrefix = () => {
  const prefix =
    process.env.CLOUDINARY_SEED_FOLDER_PREFIX ??
    process.env.CLOUDINARY_UPLOAD_FOLDER_PREFIX ??
    '';
  const normalizedPrefix = toCloudinarySlug(prefix, '').replace(
    /^\/+|\/+$/g,
    '',
  );

  return normalizedPrefix || null;
};

const stringifySignatureValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(',');
  }

  return String(value);
};

const createCloudinarySignature = (
  paramsToSign: Record<string, unknown>,
  apiSecret: string,
) => {
  const params = Object.entries(paramsToSign)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${stringifySignatureValue(value)}`)
    .join('&');

  return createHash('sha1').update(`${params}${apiSecret}`).digest('hex');
};

const isImageFile = (filePath: string) =>
  IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());

const getLeadingNumber = (filePath: string) => {
  const match = path.basename(filePath).match(/^(\d+)/);

  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const sortImageFiles = (files: string[]) =>
  [...files].sort((left, right) => {
    const leftOrder = getLeadingNumber(left);
    const rightOrder = getLeadingNumber(right);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return path.basename(left).localeCompare(path.basename(right), 'en');
  });

const getMainImageIndex = (files: string[]) => {
  const mainIndex = files.findIndex((file) =>
    /(?:^|-)main(?:-|$)/.test(getFileNameSlug(file)),
  );

  return mainIndex >= 0 ? mainIndex : 0;
};

const readDirectoryEntries = async (directoryPath: string) => {
  try {
    return await readdir(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const walkDirectories = async (root: string, depth = 0): Promise<string[]> => {
  if (depth > MAX_DIRECTORY_DEPTH) {
    return [];
  }

  const entries = await readDirectoryEntries(root);
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name));
  const childDirectories = await Promise.all(
    directories.map((directory) => walkDirectories(directory, depth + 1)),
  );

  return [root, ...directories, ...childDirectories.flat()];
};

const findProductDirectories = async (sourceRoot: string) => {
  const productSlugSet = new Set(
    portfolioProducts.map((product) => product.slug),
  );
  const directories = await walkDirectories(sourceRoot);
  const productDirectoryMap = new Map<string, string[]>();

  directories.forEach((directory) => {
    const directoryName = path.basename(directory);

    if (!productSlugSet.has(directoryName)) {
      return;
    }

    const current = productDirectoryMap.get(directoryName) ?? [];
    productDirectoryMap.set(directoryName, [...current, directory]);
  });

  return productDirectoryMap;
};

const getColorInfo = (folderName: string) => {
  const normalizedFolderName = folderName.trim();
  const folderSlug = toCloudinarySlug(normalizedFolderName, 'color');
  const colorName =
    colorNameBySlug[folderSlug] ??
    Object.keys(colorSlugMap).find((name) => name === normalizedFolderName);

  if (!colorName) {
    return null;
  }

  return { colorName, colorSlug: colorSlugMap[colorName] ?? folderSlug };
};

const getImageFilesInDirectory = async (directoryPath: string) => {
  const entries = await readDirectoryEntries(directoryPath);

  return sortImageFiles(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(directoryPath, entry.name))
      .filter(isImageFile),
  );
};

const getProductImageGroups = async (
  productDirectory: string,
): Promise<ProductImageGroup[]> => {
  const entries = await readDirectoryEntries(productDirectory);
  const directFiles = await getImageFilesInDirectory(productDirectory);
  const groups: ProductImageGroup[] =
    directFiles.length > 0
      ? [{ colorName: null, colorSlug: null, files: directFiles }]
      : [];
  const childDirectories = entries.filter((entry) => entry.isDirectory());

  for (const entry of childDirectories) {
    const colorInfo = getColorInfo(entry.name);

    if (!colorInfo) {
      continue;
    }

    const files = await getImageFilesInDirectory(
      path.join(productDirectory, entry.name),
    );

    if (files.length === 0) {
      continue;
    }

    groups.push({
      colorName: colorInfo.colorName,
      colorSlug: colorInfo.colorSlug,
      files,
    });
  }

  return groups;
};

const joinCloudinaryFolder = (parts: Array<string | null>) =>
  parts.filter((part): part is string => Boolean(part)).join('/');

const uploadImageToCloudinary = async ({
  filePath,
  folder,
  publicId,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
}: {
  filePath: string;
  folder: string;
  publicId: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}): Promise<CloudinaryUploadResponse> => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    upload_preset: uploadPreset,
    folder,
    public_id: publicId,
    overwrite: 'true',
    invalidate: 'true',
  };
  const fileBuffer = await readFile(filePath);
  const formData = new FormData();
  const extension = path.extname(filePath).toLowerCase();
  const file = new Blob([new Uint8Array(fileBuffer)], {
    type: IMAGE_MIME_TYPES[extension] ?? 'application/octet-stream',
  });

  formData.append('file', file, path.basename(filePath));
  formData.append('api_key', apiKey);
  formData.append(
    'signature',
    createCloudinarySignature(paramsToSign, apiSecret),
  );
  Object.entries(paramsToSign).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw new Error(
      errorBody?.error?.message ??
        `Cloudinary upload failed: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as Partial<CloudinaryUploadResponse>;

  if (!body.secure_url || !body.public_id) {
    throw new Error(`Cloudinary upload response is invalid: ${filePath}`);
  }

  return {
    secure_url: body.secure_url,
    public_id: body.public_id,
  };
};

const uploadProductImageGroup = async ({
  product,
  group,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
  folderPrefix,
}: {
  product: ProductSeed;
  group: ProductImageGroup;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folderPrefix: string | null;
}): Promise<SeedImageManifestProduct> => {
  const folder = joinCloudinaryFolder([
    folderPrefix,
    'products',
    product.categoryName,
    product.slug,
    group.colorSlug,
  ]);
  const sortedFiles = sortImageFiles(group.files);
  const mainImageIndex = getMainImageIndex(sortedFiles);
  const images: SeedImageManifestImage[] = [];

  for (const [index, filePath] of sortedFiles.entries()) {
    const publicId = getFileNameSlug(filePath);
    const uploaded = await uploadImageToCloudinary({
      filePath,
      folder,
      publicId,
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset,
    });

    images.push({
      fileName: path.basename(filePath),
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      order: index,
      isMain: index === mainImageIndex,
    });

    console.log(`Uploaded ${uploaded.public_id}`);
  }

  return {
    productSlug: product.slug,
    categorySlug: product.categoryName,
    colorName: group.colorName,
    colorSlug: group.colorSlug,
    images,
  };
};

const uploadSingleSeedImage = async ({
  filePath,
  folder,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
}: {
  filePath: string;
  folder: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}): Promise<SeedImageManifestImage> => {
  const publicId = getFileNameSlug(filePath);
  const uploaded = await uploadImageToCloudinary({
    filePath,
    folder,
    publicId,
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  });

  console.log(`Uploaded ${uploaded.public_id}`);

  return {
    fileName: path.basename(filePath),
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    order: 0,
    isMain: true,
  };
};

const getFirstImageFileInDirectory = async (directoryPath: string) => {
  const files = await getImageFilesInDirectory(directoryPath);

  return files[0] ?? null;
};

const findSeedAssetDirectories = async (
  sourceRoot: string,
  relativeRoot: string,
) => {
  const root = path.join(sourceRoot, relativeRoot);
  const entries = await readDirectoryEntries(root);
  const directoryMap = new Map<string, string>();

  entries
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      directoryMap.set(entry.name, path.join(root, entry.name));
    });

  return directoryMap;
};

const mergeSeedAssetDirectories = (
  ...directoryMaps: Array<Map<string, string>>
) => {
  const merged = new Map<string, string>();

  directoryMaps.forEach((directoryMap) => {
    directoryMap.forEach((directory, key) => {
      if (!merged.has(key)) {
        merged.set(key, directory);
      }
    });
  });

  return merged;
};

const uploadCategoryImage = async ({
  category,
  directory,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
  folderPrefix,
}: {
  category: CategorySeed;
  directory: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folderPrefix: string | null;
}): Promise<SeedImageManifestCategory | null> => {
  const filePath = await getFirstImageFileInDirectory(directory);

  if (!filePath) {
    return null;
  }

  const folder = joinCloudinaryFolder([
    folderPrefix,
    'categories',
    category.slug,
  ]);
  const image = await uploadSingleSeedImage({
    filePath,
    folder,
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  });

  return {
    categorySlug: category.slug,
    image,
  };
};

const uploadHeroImage = async ({
  heroType,
  heroKey,
  categorySlug,
  directory,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
  folderPrefix,
}: {
  heroType: string;
  heroKey: string;
  categorySlug: string | null;
  directory: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folderPrefix: string | null;
}): Promise<SeedImageManifestHero | null> => {
  const filePath = await getFirstImageFileInDirectory(directory);

  if (!filePath) {
    return null;
  }

  const folder = joinCloudinaryFolder([
    folderPrefix,
    'heroes',
    heroType,
    heroKey,
  ]);
  const image = await uploadSingleSeedImage({
    filePath,
    folder,
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  });

  return {
    heroType,
    heroKey,
    categorySlug,
    image,
  };
};

const uploadHomeItemImage = async ({
  sectionKey,
  itemKey,
  directory,
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset,
  folderPrefix,
}: {
  sectionKey: string;
  itemKey: string;
  directory: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folderPrefix: string | null;
}): Promise<SeedImageManifestHomeItem | null> => {
  const filePath = await getFirstImageFileInDirectory(directory);

  if (!filePath) {
    return null;
  }

  const folder = joinCloudinaryFolder([
    folderPrefix,
    'home',
    sectionKey,
    itemKey,
  ]);
  const image = await uploadSingleSeedImage({
    filePath,
    folder,
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  });

  return {
    sectionKey,
    itemKey,
    image,
  };
};

const uploadSeedImages = async () => {
  const { sourceRoot, target, homeSectionKey, homeItemKey } = parseUploadArgs(
    process.argv.slice(2),
  );
  const existingManifest = readSeedImageManifest();
  const cloudName = getCloudinaryCloudName();
  const apiKey = getCloudinaryApiKey();
  const apiSecret = getCloudinaryApiSecret();
  const uploadPreset = getProductUploadPreset();
  const folderPrefix = getFolderPrefix();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary cloud name/api key/api secret is not configured.',
    );
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary product upload preset is not configured.');
  }

  const uploadProducts = shouldUploadProducts(target);
  const uploadCategories = shouldUploadCategories(target);
  const uploadHeroes = shouldUploadHeroes(target);
  const uploadHomeItems = shouldUploadHomeItems(target);
  const isFilteredHomeUpload = Boolean(homeSectionKey || homeItemKey);
  const manifestProducts: SeedImageManifestProduct[] = uploadProducts
    ? []
    : (existingManifest?.products ?? []);
  const manifestCategories: SeedImageManifestCategory[] = uploadCategories
    ? []
    : (existingManifest?.categories ?? []);
  const manifestHeroes: SeedImageManifestHero[] = uploadHeroes
    ? []
    : (existingManifest?.heroes ?? []);
  const manifestHomeItems: SeedImageManifestHomeItem[] = uploadHomeItems
    ? isFilteredHomeUpload
      ? (existingManifest?.homeItems ?? []).filter(
          (item) => !isMatchingHomeItem(item, homeSectionKey, homeItemKey),
        )
      : []
    : (existingManifest?.homeItems ?? []);

  console.log(`Seed image upload target: ${target}`);
  console.log(`Seed image source root: ${sourceRoot}`);
  if (isFilteredHomeUpload) {
    console.log(
      `Seed image home filter: section=${homeSectionKey ?? '*'}, item=${homeItemKey ?? '*'}`,
    );
  }

  if (uploadProducts) {
    const productDirectories = await findProductDirectories(sourceRoot);

    for (const product of portfolioProducts) {
      const directories = productDirectories.get(product.slug) ?? [];
      const [productDirectory] = directories.sort((left, right) =>
        left.localeCompare(right),
      );

      if (!productDirectory) {
        continue;
      }

      if (directories.length > 1) {
        console.warn(
          `Multiple image folders found for ${product.slug}. Using ${productDirectory}`,
        );
      }

      const imageGroups = await getProductImageGroups(productDirectory);

      for (const group of imageGroups) {
        manifestProducts.push(
          await uploadProductImageGroup({
            product,
            group,
            cloudName,
            apiKey,
            apiSecret,
            uploadPreset,
            folderPrefix,
          }),
        );
      }
    }
  }

  if (uploadCategories) {
    const categoryDirectories = await findSeedAssetDirectories(
      sourceRoot,
      'categories',
    );

    for (const category of portfolioProductCategories) {
      const directory = categoryDirectories.get(category.slug);

      if (!directory) {
        continue;
      }

      const uploadedCategory = await uploadCategoryImage({
        category,
        directory,
        cloudName,
        apiKey,
        apiSecret,
        uploadPreset,
        folderPrefix,
      });

      if (uploadedCategory) {
        manifestCategories.push(uploadedCategory);
      }
    }
  }

  if (uploadHeroes) {
    const mainHeroDirectories = await findSeedAssetDirectories(
      sourceRoot,
      path.join('heroes', 'main'),
    );
    const productHeroDirectories = mergeSeedAssetDirectories(
      await findSeedAssetDirectories(
        sourceRoot,
        path.join('heroes', 'product'),
      ),
      await findSeedAssetDirectories(
        sourceRoot,
        path.join('heroes', 'products'),
      ),
    );
    const productAllHeroDirectories = await findSeedAssetDirectories(
      sourceRoot,
      path.join('heroes', 'product-all'),
    );
    const productDiscountsHeroDirectories = await findSeedAssetDirectories(
      sourceRoot,
      path.join('heroes', 'product-discounts'),
    );

    for (const [heroKey, directory] of mainHeroDirectories.entries()) {
      const uploadedHero = await uploadHeroImage({
        heroType: 'main',
        heroKey,
        categorySlug: null,
        directory,
        cloudName,
        apiKey,
        apiSecret,
        uploadPreset,
        folderPrefix,
      });

      if (uploadedHero) {
        manifestHeroes.push(uploadedHero);
      }
    }

    for (const category of portfolioProductCategories) {
      if (!category.parentSlug) {
        continue;
      }

      const directory = productHeroDirectories.get(category.slug);

      if (!directory) {
        continue;
      }

      const uploadedHero = await uploadHeroImage({
        heroType: 'product',
        heroKey: category.slug,
        categorySlug: category.slug,
        directory,
        cloudName,
        apiKey,
        apiSecret,
        uploadPreset,
        folderPrefix,
      });

      if (uploadedHero) {
        manifestHeroes.push(uploadedHero);
      }
    }

    const productAllHeroDirectory =
      productAllHeroDirectories.get(PRODUCT_ALL_HERO_KEY) ??
      productAllHeroDirectories.get('product-all') ??
      path.join(sourceRoot, 'heroes', 'product-all');
    const uploadedProductAllHero = await uploadHeroImage({
      heroType: 'product-all',
      heroKey: PRODUCT_ALL_HERO_KEY,
      categorySlug: null,
      directory: productAllHeroDirectory,
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset,
      folderPrefix,
    });

    if (uploadedProductAllHero) {
      manifestHeroes.push(uploadedProductAllHero);
    }

    const productDiscountsHeroDirectory =
      productDiscountsHeroDirectories.get(PRODUCT_DISCOUNTS_HERO_KEY) ??
      productDiscountsHeroDirectories.get('product-discounts') ??
      path.join(sourceRoot, 'heroes', 'product-discounts');
    const uploadedProductDiscountsHero = await uploadHeroImage({
      heroType: 'product-discounts',
      heroKey: PRODUCT_DISCOUNTS_HERO_KEY,
      categorySlug: null,
      directory: productDiscountsHeroDirectory,
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset,
      folderPrefix,
    });

    if (uploadedProductDiscountsHero) {
      manifestHeroes.push(uploadedProductDiscountsHero);
    }
  }

  if (uploadHomeItems) {
    for (const section of homeSections) {
      if (homeSectionKey && section.key !== homeSectionKey) {
        continue;
      }

      const itemDirectories = await findSeedAssetDirectories(
        sourceRoot,
        path.join('home', section.key),
      );

      for (const item of section.items) {
        if (homeItemKey && item.itemKey !== homeItemKey) {
          continue;
        }

        const directory = itemDirectories.get(item.itemKey);

        if (!directory) {
          continue;
        }

        const uploadedHomeItem = await uploadHomeItemImage({
          sectionKey: section.key,
          itemKey: item.itemKey,
          directory,
          cloudName,
          apiKey,
          apiSecret,
          uploadPreset,
          folderPrefix,
        });

        if (uploadedHomeItem) {
          manifestHomeItems.push(uploadedHomeItem);
        }
      }
    }
  }

  const manifest: SeedImageManifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot,
    cloudName,
    folderPrefix,
    products: manifestProducts,
    categories: manifestCategories,
    heroes: manifestHeroes,
    homeItems: manifestHomeItems,
  };
  const manifestPath = getSeedImageManifestPath();

  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf-8',
  );

  console.log(`Wrote seed image manifest: ${manifestPath}`);
  console.log(`Synced seed image products: ${manifest.products.length}`);
  console.log(
    `Synced seed image categories: ${manifest.categories?.length ?? 0}`,
  );
  console.log(`Synced seed image heroes: ${manifest.heroes?.length ?? 0}`);
  console.log(
    `Synced seed image home items: ${manifest.homeItems?.length ?? 0}`,
  );
};

uploadSeedImages().catch((error) => {
  console.error('Upload seed images failed:', error);
  process.exit(1);
});
