import 'server-only';

import { Prisma, UserRole } from '@prisma/client';

import { ADMIN_ERROR_CODE } from '@shared/constants/adminErrorCode';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/lib/errors/httpError';

import { auth } from 'auth';
import prisma from 'prisma/prismaClientSingleton';

import type { ProductLine } from '@prisma/client';

export async function assertAdminReadAccess() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError(
      'Admin login is required.',
      ADMIN_ERROR_CODE.ADMIN_LOGIN_REQUIRED,
    );
  }

  return { userId };
}

export async function getAdminPermission() {
  const { userId } = await assertAdminReadAccess();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return {
    canWriteAdmin: user?.role === UserRole.ADMIN,
  };
}

export async function assertAdminWriteAccess() {
  const { canWriteAdmin } = await getAdminPermission();

  if (!canWriteAdmin) {
    throw new ForbiddenError(
      'You do not have admin permission.',
      ADMIN_ERROR_CODE.ADMIN_WRITE_FORBIDDEN,
    );
  }
}

const toNullableString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const toOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const getPrismaConflictErrorCode = (error: unknown, fallback: string) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return ADMIN_ERROR_CODE.UNIQUE_CONSTRAINT;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return ADMIN_ERROR_CODE.RELATION_CONSTRAINT;
  }

  return fallback;
};

const getPrismaConflictMessage = (error: unknown, fallback: string) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return 'This unique value is already in use.';
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return 'This item cannot be deleted because related data exists.';
  }

  return fallback;
};

export type AdminHeroInput = {
  name_en: string;
  name_ko: string;
  heroTypeId: number;
  targetCategoryId?: number | null;
  image_url?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  description?: string | null;
  detailed_description?: string | null;
  position?: string | null;
  isDefault: boolean;
  textTone: string;
  navTone: string;
  overlayTone: string;
  translations: AdminHeroTranslationInput[];
};

export type AdminHeroTranslationInput = {
  locale: 'ko' | 'en';
  name: string;
  description?: string | null;
  detailed_description?: string | null;
};

export type AdminProductInput = {
  name_en: string;
  slug: string;
  name_ko?: string | null;
  search_keyword: string;
  description: string;
  detailed_description?: string | null;
  note?: string | null;
  price: number;
  discountRate: number;
  productLine?: ProductLine | null;
  categoryId: number;
  colorIds: number[];
  defaultColorId?: number | null;
  images: AdminProductImageInput[];
  translations: AdminProductTranslationInput[];
};

export type AdminProductTranslationInput = {
  locale: 'ko' | 'en';
  name: string;
  description: string;
  detailed_description?: string | null;
  note?: string | null;
};

export type AdminProductImageInput = {
  id?: number | null;
  image_url: string;
  colorId?: number | null;
  order: number;
  isMain: boolean;
};

export type AdminHomeSectionInput = {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  displayOrder: number;
  isVisible: boolean;
  translations: AdminHomeSectionTranslationInput[];
};

export type AdminHomeSectionTranslationInput = {
  locale: 'ko' | 'en';
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
};

export type AdminHomeSectionItemInput = {
  sectionId?: number;
  label?: string | null;
  title: string;
  description?: string | null;
  cta?: string | null;
  href?: string | null;
  targetCategoryId?: number | null;
  targetProductId?: number | null;
  image_url: string;
  imageAlt?: string | null;
  displayOrder: number;
  isVisible: boolean;
  layoutGroup: number;
  layoutGroupClassName?: string | null;
  layoutAreaClassName?: string | null;
  labelPosition?: string | null;
  imageClassName?: string | null;
  translations: AdminHomeSectionItemTranslationInput[];
};

export type AdminHomeSectionItemTranslationInput = {
  locale: 'ko' | 'en';
  label?: string | null;
  title: string;
  description?: string | null;
  cta?: string | null;
  imageAlt?: string | null;
};

export type AdminProductListParams = {
  page: number;
  limit: number;
  keyword?: string;
  categoryId?: number;
};

type AdminReviewStatus = 'all' | 'visible' | 'hidden';

export type AdminReviewListParams = {
  page: number;
  limit: number;
  keyword?: string;
  status: AdminReviewStatus;
};

type AdminPageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ADMIN_HERO_TYPE_NAMES = [
  'main',
  'product',
  'product-all',
  'product-discounts',
];

const adminHeroSelect = {
  id: true,
  name_en: true,
  name_ko: true,
  image_url: true,
  image_width: true,
  image_height: true,
  description: true,
  detailed_description: true,
  position: true,
  isDefault: true,
  textTone: true,
  navTone: true,
  overlayTone: true,
  heroTypeId: true,
  heroType: {
    select: {
      id: true,
      name: true,
    },
  },
  targetCategoryId: true,
  targetCategory: {
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      slug: true,
    },
  },
  translations: {
    select: {
      locale: true,
      name: true,
      description: true,
      detailed_description: true,
    },
    orderBy: { locale: 'asc' },
  },
} satisfies Prisma.HeroSelect;

const adminProductSelect = {
  id: true,
  name_en: true,
  slug: true,
  name_ko: true,
  search_keyword: true,
  description: true,
  detailed_description: true,
  note: true,
  price: true,
  discountRate: true,
  productLine: true,
  categoryId: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      slug: true,
    },
  },
  ProductImage: {
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      image_url: true,
      order: true,
      isMain: true,
      productColorId: true,
      productColor: {
        select: {
          colorId: true,
        },
      },
    },
  },
  productColor: {
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    select: {
      id: true,
      colorId: true,
      isDefault: true,
      color: {
        select: {
          id: true,
          name: true,
          hex: true,
          translations: {
            select: {
              locale: true,
              name: true,
            },
            orderBy: { locale: 'asc' },
          },
        },
      },
    },
  },
  translations: {
    select: {
      locale: true,
      name: true,
      description: true,
      detailed_description: true,
      note: true,
    },
    orderBy: { locale: 'asc' },
  },
} satisfies Prisma.ProductSelect;

const adminReviewSelect = {
  id: true,
  rating: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  adminHiddenAt: true,
  product: {
    select: {
      id: true,
      name_ko: true,
      name_en: true,
      slug: true,
      translations: {
        select: {
          locale: true,
          name: true,
        },
        orderBy: { locale: 'asc' },
      },
    },
  },
  orderItem: {
    select: {
      colorName: true,
      productColor: {
        select: {
          color: {
            select: {
              name: true,
              hex: true,
              translations: {
                select: {
                  locale: true,
                  name: true,
                },
                orderBy: { locale: 'asc' },
              },
            },
          },
        },
      },
    },
  },
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  ProductReviewImage: {
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      image_url: true,
      order: true,
    },
  },
} satisfies Prisma.ProductReviewSelect;

type AdminReviewRecord = Prisma.ProductReviewGetPayload<{
  select: typeof adminReviewSelect;
}>;

type AdminColorTranslationMap = Map<
  string,
  Array<{ locale: string; name: string }>
>;

const getAdminColorTranslationMap = async () => {
  const colors = await prisma.color.findMany({
    select: {
      name: true,
      translations: {
        select: {
          locale: true,
          name: true,
        },
      },
    },
  });

  return new Map(
    colors.map((color) => [
      color.name,
      color.translations.map((translation) => ({
        locale: translation.locale,
        name: translation.name,
      })),
    ]),
  );
};

const serializeAdminReview = (
  review: AdminReviewRecord,
  colorTranslationMap?: AdminColorTranslationMap,
) => {
  const { ProductReviewImage, orderItem, ...reviewData } = review;
  const linkedColorTranslations =
    orderItem.productColor?.color.translations.map((translation) => ({
      locale: translation.locale,
      name: translation.name,
    })) ?? [];
  const legacyColorTranslations =
    orderItem.colorName && linkedColorTranslations.length === 0
      ? (colorTranslationMap?.get(orderItem.colorName) ?? [])
      : [];

  return {
    ...reviewData,
    orderItem: {
      colorName:
        orderItem.colorName ?? orderItem.productColor?.color.name ?? null,
      colorHex: orderItem.productColor?.color.hex ?? null,
      colorTranslations:
        linkedColorTranslations.length > 0
          ? linkedColorTranslations
          : legacyColorTranslations,
    },
    images: ProductReviewImage,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    adminHiddenAt: review.adminHiddenAt?.toISOString() ?? null,
  };
};

const adminHomeSectionSelect = {
  id: true,
  key: true,
  eyebrow: true,
  title: true,
  subtitle: true,
  displayOrder: true,
  isVisible: true,
  translations: {
    select: {
      locale: true,
      eyebrow: true,
      title: true,
      subtitle: true,
    },
    orderBy: { locale: 'asc' },
  },
  items: {
    orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      sectionId: true,
      label: true,
      title: true,
      description: true,
      cta: true,
      href: true,
      targetCategoryId: true,
      targetCategory: {
        select: {
          id: true,
          name_en: true,
          name_ko: true,
          slug: true,
        },
      },
      targetProductId: true,
      targetProduct: {
        select: {
          id: true,
          name_en: true,
          name_ko: true,
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
      image_url: true,
      imageAlt: true,
      displayOrder: true,
      isVisible: true,
      layoutGroup: true,
      layoutGroupClassName: true,
      layoutAreaClassName: true,
      labelPosition: true,
      imageClassName: true,
      translations: {
        select: {
          locale: true,
          label: true,
          title: true,
          description: true,
          cta: true,
          imageAlt: true,
        },
        orderBy: { locale: 'asc' },
      },
    },
  },
} satisfies Prisma.HomeSectionSelect;

const HOME_CATEGORY_CAROUSEL_SECTION_KEY = 'category-carousel';
const HOME_CAROUSEL_LAYOUT_PRESET_LIMITS = new Map([
  ['lg:grid-areas-home-3', 3],
]);

const getHomeCarouselLayoutPresetLimit = (layoutGroupClassName: string) =>
  HOME_CAROUSEL_LAYOUT_PRESET_LIMITS.get(layoutGroupClassName) ?? 3;

export async function getAdminHomeSections() {
  const [sections, categories, products] = await Promise.all([
    prisma.homeSection.findMany({
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      select: adminHomeSectionSelect,
    }),
    prisma.productCategory.findMany({
      where: { isVisible: true },
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, name_en: true, name_ko: true, slug: true },
    }),
    prisma.product.findMany({
      orderBy: [{ categoryId: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name_en: true,
        name_ko: true,
        slug: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
    }),
  ]);

  return { sections, categories, products };
}

export async function updateAdminHomeSection(
  sectionId: number,
  input: AdminHomeSectionInput,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.homeSection.update({
        where: { id: sectionId },
        data: {
          eyebrow: toNullableString(input.eyebrow),
          title: input.title,
          subtitle: toNullableString(input.subtitle),
          displayOrder: input.displayOrder,
          isVisible: input.isVisible,
        },
      });

      await upsertHomeSectionTranslations(
        tx,
        sectionId,
        input.translations,
      );

      return tx.homeSection.findUniqueOrThrow({
        where: { id: sectionId },
        select: adminHomeSectionSelect,
      });
    });
  } catch (error) {
    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not update the home section.'),
      getPrismaConflictErrorCode(
        error,
        ADMIN_ERROR_CODE.HOME_SECTION_UPDATE_FAILED,
      ),
    );
  }
}

const upsertHomeSectionTranslations = async (
  tx: Prisma.TransactionClient,
  sectionId: number,
  translations: AdminHomeSectionTranslationInput[],
) => {
  await Promise.all(
    translations.map((translation) =>
      tx.homeSectionTranslation.upsert({
        where: {
          sectionId_locale: {
            sectionId,
            locale: translation.locale,
          },
        },
        create: {
          sectionId,
          locale: translation.locale,
          eyebrow: toNullableString(translation.eyebrow),
          title: translation.title,
          subtitle: toNullableString(translation.subtitle),
        },
        update: {
          eyebrow: toNullableString(translation.eyebrow),
          title: translation.title,
          subtitle: toNullableString(translation.subtitle),
        },
      }),
    ),
  );
};

const getHomeSectionItemTranslationCreateData = (
  translations: AdminHomeSectionItemTranslationInput[],
) =>
  translations.map((translation) => ({
    locale: translation.locale,
    label: toNullableString(translation.label),
    title: translation.title,
    description: toNullableString(translation.description),
    cta: toNullableString(translation.cta),
    imageAlt: toNullableString(translation.imageAlt),
  }));

const upsertHomeSectionItemTranslations = async (
  tx: Prisma.TransactionClient,
  itemId: number,
  translations: AdminHomeSectionItemTranslationInput[],
) => {
  await Promise.all(
    translations.map((translation) =>
      tx.homeSectionItemTranslation.upsert({
        where: {
          itemId_locale: {
            itemId,
            locale: translation.locale,
          },
        },
        create: {
          itemId,
          locale: translation.locale,
          label: toNullableString(translation.label),
          title: translation.title,
          description: toNullableString(translation.description),
          cta: toNullableString(translation.cta),
          imageAlt: toNullableString(translation.imageAlt),
        },
        update: {
          label: toNullableString(translation.label),
          title: translation.title,
          description: toNullableString(translation.description),
          cta: toNullableString(translation.cta),
          imageAlt: toNullableString(translation.imageAlt),
        },
      }),
    ),
  );
};

const getAdminHomeSectionItemData = (input: AdminHomeSectionItemInput) => ({
  label: toNullableString(input.label),
  title: input.title,
  description: toNullableString(input.description),
  cta: toNullableString(input.cta),
  href: toNullableString(input.href),
  targetCategoryId: input.targetCategoryId ?? null,
  targetProductId: input.targetProductId ?? null,
  image_url: input.image_url,
  imageAlt: toNullableString(input.imageAlt),
  displayOrder: input.displayOrder,
  isVisible: input.isVisible,
  layoutGroup: input.layoutGroup,
  layoutGroupClassName: toNullableString(input.layoutGroupClassName),
  layoutAreaClassName: toNullableString(input.layoutAreaClassName),
  labelPosition: toNullableString(input.labelPosition),
  imageClassName: toNullableString(input.imageClassName),
});

const validateAdminHomeSectionItemLayout = async (
  tx: Prisma.TransactionClient,
  params: {
    sectionId: number;
    input: AdminHomeSectionItemInput;
    excludeItemId?: number;
  },
) => {
  const { sectionId, input, excludeItemId } = params;
  const section = await tx.homeSection.findUnique({
    where: { id: sectionId },
    select: { id: true, key: true },
  });

  if (!section) {
    throw new NotFoundError(
      'Home section not found.',
      ADMIN_ERROR_CODE.HOME_SECTION_NOT_FOUND,
    );
  }

  if (section.key !== HOME_CATEGORY_CAROUSEL_SECTION_KEY) {
    return;
  }

  if (!input.isVisible || input.layoutGroup <= 0) {
    return;
  }

  const layoutGroupClassName = toNullableString(input.layoutGroupClassName);
  const layoutAreaClassName = toNullableString(input.layoutAreaClassName);

  if (!layoutGroupClassName || !layoutAreaClassName) {
    throw new ConflictError(
      'Cards shown in the Categories carousel require a carousel page and card position.',
      ADMIN_ERROR_CODE.HOME_CARD_CAROUSEL_FIELDS_REQUIRED,
    );
  }

  if (!HOME_CAROUSEL_LAYOUT_PRESET_LIMITS.has(layoutGroupClassName)) {
    throw new ConflictError(
      'This Categories carousel layout is not supported.',
      ADMIN_ERROR_CODE.HOME_CARD_UNSUPPORTED_LAYOUT,
    );
  }

  const baseWhere: Prisma.HomeSectionItemWhereInput = {
    sectionId,
    isVisible: true,
    layoutGroup: input.layoutGroup,
    ...(excludeItemId ? { id: { not: excludeItemId } } : {}),
  };
  const existingPresetItem = await tx.homeSectionItem.findFirst({
    where: {
      ...baseWhere,
      layoutGroupClassName: { not: null },
    },
    select: { layoutGroupClassName: true },
  });

  if (
    existingPresetItem?.layoutGroupClassName &&
    existingPresetItem.layoutGroupClassName !== layoutGroupClassName
  ) {
    throw new ConflictError(
      'Only one layout preset can be used on the same carousel page.',
      ADMIN_ERROR_CODE.HOME_CARD_PRESET_CONFLICT,
    );
  }

  const existingAreaItem = await tx.homeSectionItem.findFirst({
    where: {
      ...baseWhere,
      layoutAreaClassName,
    },
    select: { id: true },
  });

  if (existingAreaItem) {
    throw new ConflictError(
      'This card position is already used on the same carousel page.',
      ADMIN_ERROR_CODE.HOME_CARD_AREA_CONFLICT,
    );
  }

  const layoutGroupItemCount = await tx.homeSectionItem.count({
    where: {
      ...baseWhere,
      layoutAreaClassName: { not: null },
    },
  });
  const layoutGroupLimit =
    getHomeCarouselLayoutPresetLimit(layoutGroupClassName);

  if (layoutGroupItemCount >= layoutGroupLimit) {
    throw new ConflictError(
      `The selected layout preset can show up to ${layoutGroupLimit} cards on carousel page ${input.layoutGroup}.`,
      ADMIN_ERROR_CODE.HOME_CARD_LAYOUT_LIMIT_EXCEEDED,
    );
  }
};

export async function createAdminHomeSectionItem(
  input: AdminHomeSectionItemInput & { sectionId: number },
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await validateAdminHomeSectionItemLayout(tx, {
        sectionId: input.sectionId,
        input,
      });

      return tx.homeSectionItem.create({
        data: {
          sectionId: input.sectionId,
          ...getAdminHomeSectionItemData(input),
          translations: {
            create: getHomeSectionItemTranslationCreateData(
              input.translations,
            ),
          },
        },
        select: {
          ...adminHomeSectionSelect.items.select,
        },
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not create the home section item.'),
      getPrismaConflictErrorCode(
        error,
        ADMIN_ERROR_CODE.HOME_CARD_CREATE_FAILED,
      ),
    );
  }
}

export async function updateAdminHomeSectionItem(
  itemId: number,
  input: AdminHomeSectionItemInput,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.homeSectionItem.findUnique({
        where: { id: itemId },
        select: { sectionId: true },
      });

      if (!item) {
        throw new NotFoundError(
          'Home card not found.',
          ADMIN_ERROR_CODE.HOME_CARD_NOT_FOUND,
        );
      }

      await validateAdminHomeSectionItemLayout(tx, {
        sectionId: item.sectionId,
        input,
        excludeItemId: itemId,
      });

      await tx.homeSectionItem.update({
        where: { id: itemId },
        data: getAdminHomeSectionItemData(input),
      });

      await upsertHomeSectionItemTranslations(
        tx,
        itemId,
        input.translations,
      );

      return tx.homeSectionItem.findUniqueOrThrow({
        where: { id: itemId },
        select: {
          ...adminHomeSectionSelect.items.select,
        },
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not update the home section item.'),
      getPrismaConflictErrorCode(
        error,
        ADMIN_ERROR_CODE.HOME_CARD_UPDATE_FAILED,
      ),
    );
  }
}

export async function getAdminHeroes() {
  const [heroTypes, categories, heroes] = await Promise.all([
    prisma.heroType.findMany({
      where: { name: { in: ADMIN_HERO_TYPE_NAMES } },
      orderBy: [{ id: 'asc' }],
      select: { id: true, name: true },
    }),
    prisma.productCategory.findMany({
      where: { parentId: { not: null }, isVisible: true },
      orderBy: [{ name_ko: 'asc' }, { id: 'asc' }],
      select: { id: true, name_en: true, name_ko: true, slug: true },
    }),
    prisma.hero.findMany({
      where: {
        heroType: { name: { in: ADMIN_HERO_TYPE_NAMES } },
      },
      orderBy: [{ heroTypeId: 'asc' }, { isDefault: 'desc' }, { id: 'asc' }],
      select: adminHeroSelect,
    }),
  ]);

  return { heroTypes, categories, heroes };
}

const resolveHeroTarget = async (
  tx: Prisma.TransactionClient,
  input: AdminHeroInput,
) => {
  const heroType = await tx.heroType.findUnique({
    where: { id: input.heroTypeId },
    select: { name: true },
  });

  if (!heroType) {
    throw new NotFoundError(
      'Hero type not found.',
      ADMIN_ERROR_CODE.HERO_TYPE_NOT_FOUND,
    );
  }

  if (!ADMIN_HERO_TYPE_NAMES.includes(heroType.name)) {
    throw new ConflictError(
      'This Hero type is not supported.',
      ADMIN_ERROR_CODE.HERO_TYPE_UNSUPPORTED,
    );
  }

  if (heroType.name !== 'product') {
    return { heroTypeName: heroType.name, targetCategoryId: null };
  }

  if (!input.targetCategoryId) {
    throw new ConflictError(
      'Product Hero requires a target category.',
      ADMIN_ERROR_CODE.HERO_PRODUCT_CATEGORY_REQUIRED,
    );
  }

  const category = await tx.productCategory.findUnique({
    where: { id: input.targetCategoryId },
    select: { id: true },
  });

  if (!category) {
    throw new NotFoundError(
      'Target category not found.',
      ADMIN_ERROR_CODE.HERO_TARGET_CATEGORY_NOT_FOUND,
    );
  }

  return { heroTypeName: heroType.name, targetCategoryId: category.id };
};

const getHeroDefaultGroupWhere = (
  heroTypeId: number,
  heroTypeName: string,
  targetCategoryId: number | null,
): Prisma.HeroWhereInput => {
  if (heroTypeName === 'product') {
    return { heroTypeId, targetCategoryId };
  }

  return { heroTypeId, targetCategoryId: null };
};

const clearOtherDefaultHeroes = async (
  tx: Prisma.TransactionClient,
  heroTypeId: number,
  heroTypeName: string,
  targetCategoryId: number | null,
  excludeHeroId?: number | null,
) => {
  await tx.hero.updateMany({
    where: {
      ...getHeroDefaultGroupWhere(heroTypeId, heroTypeName, targetCategoryId),
      isDefault: true,
      ...(excludeHeroId ? { id: { not: excludeHeroId } } : {}),
    },
    data: { isDefault: false },
  });
};

const getHeroTranslationCreateData = (
  translations: AdminHeroTranslationInput[],
) =>
  translations.map((translation) => ({
    locale: translation.locale,
    name: translation.name,
    description: toNullableString(translation.description),
    detailed_description: toNullableString(translation.detailed_description),
  }));

const upsertHeroTranslations = async (
  tx: Prisma.TransactionClient,
  heroId: number,
  translations: AdminHeroTranslationInput[],
) => {
  await Promise.all(
    translations.map((translation) =>
      tx.heroTranslation.upsert({
        where: {
          heroId_locale: {
            heroId,
            locale: translation.locale,
          },
        },
        create: {
          heroId,
          locale: translation.locale,
          name: translation.name,
          description: toNullableString(translation.description),
          detailed_description: toNullableString(
            translation.detailed_description,
          ),
        },
        update: {
          name: translation.name,
          description: toNullableString(translation.description),
          detailed_description: toNullableString(
            translation.detailed_description,
          ),
        },
      }),
    ),
  );
};

export async function createAdminHero(input: AdminHeroInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const { heroTypeName, targetCategoryId } = await resolveHeroTarget(
        tx,
        input,
      );

      if (input.isDefault) {
        await clearOtherDefaultHeroes(
          tx,
          input.heroTypeId,
          heroTypeName,
          targetCategoryId,
        );
      }

      return tx.hero.create({
        data: {
          name_en: input.name_en,
          name_ko: input.name_ko,
          heroTypeId: input.heroTypeId,
          targetCategoryId,
          image_url: toNullableString(input.image_url),
          image_width: input.image_width ?? null,
          image_height: input.image_height ?? null,
          description: toNullableString(input.description),
          detailed_description: toNullableString(input.detailed_description),
          position: toNullableString(input.position),
          isDefault: input.isDefault,
          textTone: input.textTone,
          navTone: input.navTone,
          overlayTone: input.overlayTone,
          translations: {
            create: getHeroTranslationCreateData(input.translations),
          },
        },
        select: adminHeroSelect,
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not create the Hero.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.HERO_CREATE_FAILED),
    );
  }
}

export async function updateAdminHero(heroId: number, input: AdminHeroInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const { heroTypeName, targetCategoryId } = await resolveHeroTarget(
        tx,
        input,
      );

      if (input.isDefault) {
        await clearOtherDefaultHeroes(
          tx,
          input.heroTypeId,
          heroTypeName,
          targetCategoryId,
          heroId,
        );
      }

      await tx.hero.update({
        where: { id: heroId },
        data: {
          name_en: input.name_en,
          name_ko: input.name_ko,
          heroTypeId: input.heroTypeId,
          targetCategoryId,
          image_url: toNullableString(input.image_url),
          image_width: input.image_width ?? null,
          image_height: input.image_height ?? null,
          description: toNullableString(input.description),
          detailed_description: toNullableString(input.detailed_description),
          position: toNullableString(input.position),
          isDefault: input.isDefault,
          textTone: input.textTone,
          navTone: input.navTone,
          overlayTone: input.overlayTone,
        },
      });

      await upsertHeroTranslations(tx, heroId, input.translations);

      return tx.hero.findUniqueOrThrow({
        where: { id: heroId },
        select: adminHeroSelect,
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not update the Hero.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.HERO_UPDATE_FAILED),
    );
  }
}

export async function deleteAdminHero(heroId: number) {
  try {
    await prisma.hero.delete({ where: { id: heroId } });
  } catch (error) {
    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not delete the Hero.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.HERO_DELETE_FAILED),
    );
  }
}

const createPageResult = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): AdminPageResult<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

export async function getAdminProducts(params: AdminProductListParams) {
  const { page, limit, keyword, categoryId } = params;
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const skip = (safePage - 1) * safeLimit;
  const normalizedKeyword = keyword?.trim();
  const where: Prisma.ProductWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    ...(normalizedKeyword
      ? {
          OR: [
            { name_en: { contains: normalizedKeyword } },
            { name_ko: { contains: normalizedKeyword } },
            { slug: { contains: normalizedKeyword } },
            { search_keyword: { contains: normalizedKeyword } },
          ],
        }
      : {}),
  };
  const [categories, colors, total, products] = await Promise.all([
    prisma.productCategory.findMany({
      where: { parentId: { not: null }, isVisible: true },
      orderBy: [{ name_ko: 'asc' }, { id: 'asc' }],
      select: { id: true, name_en: true, name_ko: true, slug: true },
    }),
    prisma.color.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, hex: true },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ id: 'desc' }],
      skip,
      take: safeLimit,
      select: adminProductSelect,
    }),
  ]);

  return {
    categories,
    colors,
    products: createPageResult(
      products.map((product) => ({
        ...product,
        price: Number(product.price),
        discountRate: product.discountRate,
        createdAt: product.createdAt.toISOString(),
        images: product.ProductImage.map((image) => ({
          id: image.id,
          image_url: image.image_url,
          order: image.order,
          isMain: image.isMain,
          productColorId: image.productColorId,
          colorId: image.productColor?.colorId ?? null,
        })),
        mainImageUrl:
          product.ProductImage.find((image) => image.isMain)?.image_url ??
          product.ProductImage[0]?.image_url ??
          '',
      })),
      total,
      safePage,
      safeLimit,
    ),
  };
}

const syncProductImages = async (
  tx: Prisma.TransactionClient,
  productId: number,
  images: AdminProductImageInput[],
) => {
  await tx.productImage.deleteMany({
    where: { productId },
  });

  const normalizedImages = images
    .map((image) => ({
      ...image,
      image_url: toOptionalString(image.image_url),
      colorId: image.colorId ?? null,
      order: Number.isFinite(image.order) ? Math.max(0, image.order) : 0,
    }))
    .filter((image): image is typeof image & { image_url: string } =>
      Boolean(image.image_url),
    );

  if (normalizedImages.length === 0) {
    return;
  }

  const productColorCount = await tx.productColor.count({
    where: { productId },
  });
  const hasProductColors = productColorCount > 0;

  if (hasProductColors && normalizedImages.some((image) => !image.colorId)) {
    throw new ConflictError(
      'Product images with colors require a linked color.',
      ADMIN_ERROR_CODE.PRODUCT_IMAGE_COLOR_REQUIRED,
    );
  }

  if (!hasProductColors && normalizedImages.some((image) => image.colorId)) {
    throw new ConflictError(
      'Products without colors can only use common images.',
      ADMIN_ERROR_CODE.PRODUCT_IMAGE_COMMON_ONLY,
    );
  }

  const targetColorIds = Array.from(
    new Set(
      normalizedImages
        .map((image) => image.colorId)
        .filter((colorId): colorId is number => typeof colorId === 'number'),
    ),
  );
  const productColors = await tx.productColor.findMany({
    where: { productId },
    select: { id: true, colorId: true },
  });
  const productColorIdByColorId = new Map(
    productColors.map((item) => [item.colorId, item.id]),
  );

  targetColorIds.forEach((colorId) => {
    if (!productColorIdByColorId.has(colorId)) {
      throw new NotFoundError(
        'Product color linked to the image was not found.',
        ADMIN_ERROR_CODE.PRODUCT_IMAGE_COLOR_NOT_FOUND,
      );
    }
  });

  await tx.productImage.createMany({
    data: normalizedImages.map((image) => ({
      productId,
      image_url: image.image_url,
      order: image.order,
      isMain: image.isMain,
      productColorId: image.colorId
        ? (productColorIdByColorId.get(image.colorId) ?? null)
        : null,
    })),
  });
};

const toAdminProductResponse = <
  T extends Prisma.ProductGetPayload<{ select: typeof adminProductSelect }>,
>(
  product: T,
) => ({
  ...product,
  price: Number(product.price),
  discountRate: product.discountRate,
  createdAt: product.createdAt.toISOString(),
  images: product.ProductImage.map((image) => ({
    id: image.id,
    image_url: image.image_url,
    order: image.order,
    isMain: image.isMain,
    productColorId: image.productColorId,
    colorId: image.productColor?.colorId ?? null,
  })),
  mainImageUrl:
    product.ProductImage.find((image) => image.isMain)?.image_url ??
    product.ProductImage[0]?.image_url ??
    '',
});

const syncProductColors = async (
  tx: Prisma.TransactionClient,
  productId: number,
  colorIds: number[],
  defaultColorId?: number | null,
) => {
  const uniqueColorIds = Array.from(new Set(colorIds));
  const resolvedDefaultColorId =
    uniqueColorIds.length > 0
      ? uniqueColorIds.includes(defaultColorId ?? 0)
        ? defaultColorId
        : uniqueColorIds[0]
      : null;

  if (uniqueColorIds.length > 0) {
    const colorCount = await tx.color.count({
      where: { id: { in: uniqueColorIds } },
    });

    if (colorCount !== uniqueColorIds.length) {
      throw new NotFoundError(
        'One or more selected colors do not exist.',
        ADMIN_ERROR_CODE.PRODUCT_COLOR_NOT_FOUND,
      );
    }
  }

  const existingProductColors = await tx.productColor.findMany({
    where: { productId },
    select: { id: true, colorId: true },
  });
  const removedProductColorIds = existingProductColors
    .filter((item) => !uniqueColorIds.includes(item.colorId))
    .map((item) => item.id);

  if (removedProductColorIds.length > 0) {
    const orderItemCount = await tx.orderItem.count({
      where: { productColorId: { in: removedProductColorIds } },
    });

    if (orderItemCount > 0) {
      throw new ConflictError(
        'Product colors with order history cannot be removed.',
        ADMIN_ERROR_CODE.PRODUCT_COLOR_DELETE_BLOCKED,
      );
    }

    await tx.productColor.deleteMany({
      where: { id: { in: removedProductColorIds } },
    });
  }

  if (uniqueColorIds.length === 0) {
    await tx.productColor.updateMany({
      where: { productId },
      data: { isDefault: false },
    });
    return;
  }

  await tx.productColor.createMany({
    data: uniqueColorIds.map((colorId) => ({ productId, colorId })),
    skipDuplicates: true,
  });

  await tx.productColor.updateMany({
    where: { productId },
    data: { isDefault: false },
  });

  if (resolvedDefaultColorId) {
    await tx.productColor.update({
      where: {
        productId_colorId: {
          productId,
          colorId: resolvedDefaultColorId,
        },
      },
      data: { isDefault: true },
    });
  }
};

const getProductTranslationCreateData = (
  translations: AdminProductTranslationInput[],
) =>
  translations.map((translation) => ({
    locale: translation.locale,
    name: translation.name,
    description: translation.description,
    detailed_description: toNullableString(translation.detailed_description),
    note: toNullableString(translation.note),
  }));

const upsertProductTranslations = async (
  tx: Prisma.TransactionClient,
  productId: number,
  translations: AdminProductTranslationInput[],
) => {
  await Promise.all(
    translations.map((translation) =>
      tx.productTranslation.upsert({
        where: {
          productId_locale: {
            productId,
            locale: translation.locale,
          },
        },
        create: {
          productId,
          locale: translation.locale,
          name: translation.name,
          description: translation.description,
          detailed_description: toNullableString(
            translation.detailed_description,
          ),
          note: toNullableString(translation.note),
        },
        update: {
          name: translation.name,
          description: translation.description,
          detailed_description: toNullableString(
            translation.detailed_description,
          ),
          note: toNullableString(translation.note),
        },
      }),
    ),
  );
};

export async function createAdminProduct(input: AdminProductInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name_en: input.name_en,
          slug: input.slug,
          name_ko: toNullableString(input.name_ko),
          search_keyword: input.search_keyword,
          description: input.description,
          detailed_description: toNullableString(input.detailed_description),
          note: toNullableString(input.note),
          price: input.price.toString(),
          discountRate: input.discountRate,
          productLine: input.productLine ?? null,
          categoryId: input.categoryId,
          translations: {
            create: getProductTranslationCreateData(input.translations),
          },
        },
        select: adminProductSelect,
      });

      await syncProductColors(
        tx,
        product.id,
        input.colorIds,
        input.defaultColorId,
      );
      await syncProductImages(tx, product.id, input.images);

      const refreshed = await tx.product.findUnique({
        where: { id: product.id },
        select: adminProductSelect,
      });

      if (!refreshed) {
        throw new NotFoundError(
          'Product not found.',
          ADMIN_ERROR_CODE.PRODUCT_NOT_FOUND,
        );
      }

      return toAdminProductResponse(refreshed);
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not create the product.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.PRODUCT_CREATE_FAILED),
    );
  }
}

export async function updateAdminProduct(
  productId: number,
  input: AdminProductInput,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name_en: input.name_en,
          slug: input.slug,
          name_ko: toNullableString(input.name_ko),
          search_keyword: input.search_keyword,
          description: input.description,
          detailed_description: toNullableString(input.detailed_description),
          note: toNullableString(input.note),
          price: input.price.toString(),
          discountRate: input.discountRate,
          productLine: input.productLine ?? null,
          categoryId: input.categoryId,
        },
      });

      await syncProductColors(
        tx,
        productId,
        input.colorIds,
        input.defaultColorId,
      );
      await syncProductImages(tx, productId, input.images);
      await upsertProductTranslations(tx, productId, input.translations);

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: adminProductSelect,
      });

      if (!product) {
        throw new NotFoundError(
          'Product not found.',
          ADMIN_ERROR_CODE.PRODUCT_NOT_FOUND,
        );
      }

      return toAdminProductResponse(product);
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not update the product.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.PRODUCT_UPDATE_FAILED),
    );
  }
}

export async function deleteAdminProduct(productId: number) {
  const [orderItemCount, reviewCount, cartItemCount] = await Promise.all([
    prisma.orderItem.count({ where: { productId } }),
    prisma.productReview.count({ where: { productId } }),
    prisma.cartItem.count({ where: { productId } }),
  ]);

  if (orderItemCount > 0 || reviewCount > 0 || cartItemCount > 0) {
    throw new ConflictError(
      'Products linked to orders, carts, or reviews cannot be deleted.',
      ADMIN_ERROR_CODE.PRODUCT_DELETE_BLOCKED,
    );
  }

  try {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.productFilterOption.deleteMany({ where: { productId } }),
      prisma.productDetail.deleteMany({ where: { productId } }),
      prisma.productColor.deleteMany({ where: { productId } }),
      prisma.wishlistItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
  } catch (error) {
    throw new ConflictError(
      getPrismaConflictMessage(error, 'Could not delete the product.'),
      getPrismaConflictErrorCode(error, ADMIN_ERROR_CODE.PRODUCT_DELETE_FAILED),
    );
  }
}

export async function getAdminReviews(params: AdminReviewListParams) {
  const { page, limit, keyword, status } = params;
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const skip = (safePage - 1) * safeLimit;
  const normalizedKeyword = keyword?.trim();
  const where: Prisma.ProductReviewWhereInput = {
    ...(status === 'visible' ? { adminHiddenAt: null } : {}),
    ...(status === 'hidden' ? { adminHiddenAt: { not: null } } : {}),
    ...(normalizedKeyword
      ? {
          OR: [
            { title: { contains: normalizedKeyword } },
            { content: { contains: normalizedKeyword } },
            { product: { name_ko: { contains: normalizedKeyword } } },
            { product: { name_en: { contains: normalizedKeyword } } },
            { product: { slug: { contains: normalizedKeyword } } },
            { orderItem: { colorName: { contains: normalizedKeyword } } },
            { user: { email: { contains: normalizedKeyword } } },
            { user: { name: { contains: normalizedKeyword } } },
          ],
        }
      : {}),
  };
  const [total, reviews, colorTranslationMap] = await Promise.all([
    prisma.productReview.count({ where }),
    prisma.productReview.findMany({
      where,
      orderBy: [{ adminHiddenAt: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: safeLimit,
      select: adminReviewSelect,
    }),
    getAdminColorTranslationMap(),
  ]);

  return createPageResult(
    reviews.map((review) => serializeAdminReview(review, colorTranslationMap)),
    total,
    safePage,
    safeLimit,
  );
}

export async function getAdminReviewSummary() {
  const [total, visible, hidden] = await prisma.$transaction([
    prisma.productReview.count(),
    prisma.productReview.count({ where: { adminHiddenAt: null } }),
    prisma.productReview.count({ where: { adminHiddenAt: { not: null } } }),
  ]);

  return { total, visible, hidden };
}

export async function hideAdminReview(reviewId: number) {
  const [review, colorTranslationMap] = await Promise.all([
    prisma.productReview.update({
      where: { id: reviewId },
      data: {
        adminHiddenAt: new Date(),
      },
      select: adminReviewSelect,
    }),
    getAdminColorTranslationMap(),
  ]);

  return serializeAdminReview(review, colorTranslationMap);
}

export async function restoreAdminReview(reviewId: number) {
  const [review, colorTranslationMap] = await Promise.all([
    prisma.productReview.update({
      where: { id: reviewId },
      data: {
        adminHiddenAt: null,
      },
      select: adminReviewSelect,
    }),
    getAdminColorTranslationMap(),
  ]);

  return serializeAdminReview(review, colorTranslationMap);
}
