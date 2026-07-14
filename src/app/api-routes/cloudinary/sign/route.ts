import { createHash, randomBytes } from 'crypto';

import { NextResponse } from 'next/server';

import { z } from 'zod';

import { assertAdminWriteAccess } from '@app/api-routes/admin/service';

import { CLOUDINARY_UPLOAD_ERROR_CODE } from '@shared/constants/cloudinaryUploadErrorCode';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { InternalServerError } from '@shared/lib/errors/httpError';

import {
  getHeroUploadFolderData,
  getProductUploadFolderData,
  getReviewUploadFolderData,
} from './service';

export const runtime = 'nodejs';

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined;
  }

  return value;
};

const baseSignatureBodySchema = z.object({
  imageName: z.string().trim().min(1),
  format: z.enum(['jpg']).optional(),
});

const signatureBodySchema = z.discriminatedUnion('target', [
  baseSignatureBodySchema.extend({
    target: z.literal('product'),
    categoryId: z.coerce.number().int().positive(),
    productSlug: z.string().trim().min(1),
    colorId: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().positive().optional(),
    ),
  }),
  baseSignatureBodySchema.extend({
    target: z.literal('hero'),
    heroTypeId: z.coerce.number().int().positive(),
  }),
  baseSignatureBodySchema.extend({
    target: z.literal('review'),
    orderItemId: z.coerce.number().int().positive(),
  }),
]);

type SignatureBody = z.infer<typeof signatureBodySchema>;

const getCloudinaryApiSecret = () => {
  const directSecret = process.env.CLOUDINARY_API_SECRET;
  if (directSecret) {
    return directSecret;
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    return null;
  }

  try {
    return decodeURIComponent(new URL(cloudinaryUrl).password);
  } catch {
    return null;
  }
};

const getCloudinaryApiKey = () => {
  const directApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  if (directApiKey) {
    return directApiKey;
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    return null;
  }

  try {
    return decodeURIComponent(new URL(cloudinaryUrl).username);
  } catch {
    return null;
  }
};

const getUploadPreset = (target: SignatureBody['target']) => {
  if (target === 'product') {
    return (
      process.env.NEXT_PUBLIC_CLOUDINARY_PRODUCT_UPLOAD_PRESET ??
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
      ''
    );
  }

  if (target === 'hero') {
    return (
      process.env.NEXT_PUBLIC_CLOUDINARY_HERO_UPLOAD_PRESET ??
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
      ''
    );
  }

  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_REVIEW_UPLOAD_PRESET ??
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
    ''
  );
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
    .filter(([key, value]) => {
      if (
        key === 'file' ||
        key === 'api_key' ||
        key === 'cloud_name' ||
        key === 'resource_type'
      ) {
        return false;
      }

      return value !== undefined && value !== null && value !== '';
    })
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${stringifySignatureValue(value)}`)
    .join('&');

  return createHash('sha1').update(`${params}${apiSecret}`).digest('hex');
};

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

const getCloudinaryFolderPrefix = () => {
  const prefix = process.env.CLOUDINARY_UPLOAD_FOLDER_PREFIX ?? '';
  const normalizedPrefix = toCloudinarySlug(prefix, '').replace(
    /^\/+|\/+$/g,
    '',
  );

  return normalizedPrefix || null;
};

const joinCloudinaryFolder = (parts: Array<string | null>) =>
  parts.filter((part): part is string => Boolean(part)).join('/');

const createRandomPublicId = () => randomBytes(12).toString('hex');

const resolveProductFolder = async (
  body: Extract<SignatureBody, { target: 'product' }>,
) => {
  await assertAdminWriteAccess();

  const { categorySlug, colorName } = await getProductUploadFolderData(
    body.categoryId,
    body.colorId,
  );
  const colorSlug = colorName
    ? (colorSlugMap[colorName] ?? toCloudinarySlug(colorName))
    : null;

  return joinCloudinaryFolder([
    getCloudinaryFolderPrefix(),
    'products',
    toCloudinarySlug(categorySlug, 'category'),
    toCloudinarySlug(body.productSlug, 'product'),
    ...(colorSlug ? [colorSlug] : []),
  ]);
};

const resolveHeroFolder = async (
  body: Extract<SignatureBody, { target: 'hero' }>,
) => {
  await assertAdminWriteAccess();

  const { heroTypeName } = await getHeroUploadFolderData(body.heroTypeId);

  return joinCloudinaryFolder([
    getCloudinaryFolderPrefix(),
    'heroes',
    toCloudinarySlug(heroTypeName, 'hero'),
  ]);
};

const resolveReviewFolder = async (
  body: Extract<SignatureBody, { target: 'review' }>,
) => {
  const userId = await getRequiredUserId();
  const { orderItemId, productSlug } = await getReviewUploadFolderData(
    userId,
    body.orderItemId,
  );

  return joinCloudinaryFolder([
    getCloudinaryFolderPrefix(),
    'reviews',
    toCloudinarySlug(productSlug, 'product'),
    String(orderItemId),
  ]);
};

const resolveUploadFolder = (body: SignatureBody) => {
  if (body.target === 'product') {
    return resolveProductFolder(body);
  }

  if (body.target === 'hero') {
    return resolveHeroFolder(body);
  }

  return resolveReviewFolder(body);
};

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsedBody = parseWithSchema(signatureBodySchema, body);
    const apiSecret = getCloudinaryApiSecret();
    const apiKey = getCloudinaryApiKey();
    const uploadPreset = getUploadPreset(parsedBody.target);

    if (!apiSecret || !apiKey) {
      throw new InternalServerError(
        'Cloudinary API key/secret is not configured',
        CLOUDINARY_UPLOAD_ERROR_CODE.CLOUDINARY_CONFIG_MISSING,
      );
    }

    if (!uploadPreset) {
      throw new InternalServerError(
        'Cloudinary upload preset is not configured',
        CLOUDINARY_UPLOAD_ERROR_CODE.CLOUDINARY_UPLOAD_PRESET_MISSING,
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = await resolveUploadFolder(parsedBody);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      upload_preset: uploadPreset,
      folder,
      public_id: createRandomPublicId(),
      overwrite: 'true',
      invalidate: 'true',
      ...(parsedBody.format ? { format: parsedBody.format } : {}),
    };

    return NextResponse.json({
      apiKey,
      params: paramsToSign,
      signature: createCloudinarySignature(paramsToSign, apiSecret),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
