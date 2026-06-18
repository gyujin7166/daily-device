import 'server-only';

import { Prisma, UserRole } from '@prisma/client';

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
    throw new UnauthorizedError('관리자 로그인이 필요합니다.');
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
    throw new ForbiddenError('관리자 권한이 없습니다.');
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

const getPrismaConflictMessage = (error: unknown, fallback: string) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return '이미 사용 중인 고유 값이 있습니다.';
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return '연결된 데이터가 있어 삭제할 수 없습니다.';
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
        },
      },
    },
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

const serializeAdminReview = (review: AdminReviewRecord) => {
  const { ProductReviewImage, orderItem, ...reviewData } = review;

  return {
    ...reviewData,
    orderItem: {
      colorName:
        orderItem.colorName ?? orderItem.productColor?.color.name ?? null,
      colorHex: orderItem.productColor?.color.hex ?? null,
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
    return await prisma.homeSection.update({
      where: { id: sectionId },
      data: {
        eyebrow: toNullableString(input.eyebrow),
        title: input.title,
        subtitle: toNullableString(input.subtitle),
        displayOrder: input.displayOrder,
        isVisible: input.isVisible,
      },
      select: adminHomeSectionSelect,
    });
  } catch (error) {
    throw new ConflictError(
      getPrismaConflictMessage(error, '홈 섹션을 수정할 수 없습니다.'),
    );
  }
}

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
    throw new NotFoundError('홈 섹션을 찾을 수 없습니다.');
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
      'Categories 캐러셀에 노출할 카드는 캐러셀 페이지와 카드 위치를 선택해야 합니다.',
    );
  }

  if (!HOME_CAROUSEL_LAYOUT_PRESET_LIMITS.has(layoutGroupClassName)) {
    throw new ConflictError('지원하지 않는 Categories 캐러셀 레이아웃입니다.');
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
      '같은 캐러셀 페이지에는 하나의 레이아웃 프리셋만 사용할 수 있습니다.',
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
      '같은 캐러셀 페이지에서 이미 사용 중인 카드 위치입니다.',
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
      `선택한 레이아웃 프리셋은 캐러셀 ${input.layoutGroup}페이지에 최대 ${layoutGroupLimit}개까지만 노출할 수 있습니다.`,
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
      getPrismaConflictMessage(error, '홈 섹션 아이템을 생성할 수 없습니다.'),
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
        throw new NotFoundError('홈 카드를 찾을 수 없습니다.');
      }

      await validateAdminHomeSectionItemLayout(tx, {
        sectionId: item.sectionId,
        input,
        excludeItemId: itemId,
      });

      return tx.homeSectionItem.update({
        where: { id: itemId },
        data: getAdminHomeSectionItemData(input),
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
      getPrismaConflictMessage(error, '홈 섹션 아이템을 수정할 수 없습니다.'),
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
    throw new NotFoundError('Hero 타입을 찾을 수 없습니다.');
  }

  if (!ADMIN_HERO_TYPE_NAMES.includes(heroType.name)) {
    throw new ConflictError('지원하지 않는 Hero 타입입니다.');
  }

  if (heroType.name !== 'product') {
    return { heroTypeName: heroType.name, targetCategoryId: null };
  }

  if (!input.targetCategoryId) {
    throw new ConflictError('상품 Hero는 적용 카테고리를 선택해야 합니다.');
  }

  const category = await tx.productCategory.findUnique({
    where: { id: input.targetCategoryId },
    select: { id: true },
  });

  if (!category) {
    throw new NotFoundError('적용 카테고리를 찾을 수 없습니다.');
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
        },
        select: adminHeroSelect,
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Hero를 생성할 수 없습니다.'),
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

      return tx.hero.update({
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
        select: adminHeroSelect,
      });
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, 'Hero를 수정할 수 없습니다.'),
    );
  }
}

export async function deleteAdminHero(heroId: number) {
  try {
    await prisma.hero.delete({ where: { id: heroId } });
  } catch (error) {
    throw new ConflictError(
      getPrismaConflictMessage(error, 'Hero를 삭제할 수 없습니다.'),
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
      '색상이 있는 상품 이미지는 연결 색상을 선택해야 합니다.',
    );
  }

  if (!hasProductColors && normalizedImages.some((image) => image.colorId)) {
    throw new ConflictError(
      '색상이 없는 상품 이미지는 공통 이미지로만 등록할 수 있습니다.',
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
      throw new NotFoundError('이미지에 연결할 상품 색상을 찾을 수 없습니다.');
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
      throw new NotFoundError('존재하지 않는 색상이 포함되어 있습니다.');
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
        '주문 이력이 있는 상품 색상은 제거할 수 없습니다.',
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
        throw new NotFoundError('상품을 찾을 수 없습니다.');
      }

      return toAdminProductResponse(refreshed);
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, '상품을 생성할 수 없습니다.'),
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

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: adminProductSelect,
      });

      if (!product) {
        throw new NotFoundError('상품을 찾을 수 없습니다.');
      }

      return toAdminProductResponse(product);
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }

    throw new ConflictError(
      getPrismaConflictMessage(error, '상품을 수정할 수 없습니다.'),
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
      '주문, 장바구니, 상품평에 연결된 상품은 삭제할 수 없습니다.',
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
      getPrismaConflictMessage(error, '상품을 삭제할 수 없습니다.'),
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
  const [total, reviews] = await prisma.$transaction([
    prisma.productReview.count({ where }),
    prisma.productReview.findMany({
      where,
      orderBy: [{ adminHiddenAt: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: safeLimit,
      select: adminReviewSelect,
    }),
  ]);

  return createPageResult(
    reviews.map(serializeAdminReview),
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
  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      adminHiddenAt: new Date(),
    },
    select: adminReviewSelect,
  });

  return serializeAdminReview(review);
}

export async function restoreAdminReview(reviewId: number) {
  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      adminHiddenAt: null,
    },
    select: adminReviewSelect,
  });

  return serializeAdminReview(review);
}
