import type { AdminPageResult } from '@shared/api/adminApi';
import type { ProductLineValue } from '@shared/constants/productLine';

export type ProductCategory = {
  id: number;
  name_en: string;
  name_ko: string;
  slug: string;
};

export type AdminColor = {
  id: number;
  name: string;
  hex: string;
  translations: ColorTranslation[];
};

export type ColorTranslation = {
  locale: ProductTranslationLocale;
  name: string;
};

type AdminProductColor = {
  id: number;
  colorId: number;
  isDefault: boolean;
  color: AdminColor;
};

type AdminProductImage = {
  id: number;
  image_url: string;
  order: number;
  isMain: boolean;
  productColorId: number | null;
  colorId: number | null;
};

export type AdminProduct = {
  id: number;
  name_en: string;
  slug: string;
  name_ko: string | null;
  search_keyword: string;
  description: string;
  detailed_description: string | null;
  note: string | null;
  price: number;
  discountRate: number;
  productLine: ProductLineValue | null;
  categoryId: number;
  createdAt: string;
  category: ProductCategory;
  productColor: AdminProductColor[];
  images: AdminProductImage[];
  mainImageUrl: string;
  translations: ProductTranslation[];
};

export type ProductTranslationLocale = 'ko' | 'en';

export type ProductTranslation = {
  locale: ProductTranslationLocale;
  name: string;
  description: string;
  detailed_description: string | null;
  note: string | null;
};

export type ProductTranslationFormState = {
  name: string;
  description: string;
  detailed_description: string;
  note: string;
};

export type ProductTranslationFormMap = Record<
  ProductTranslationLocale,
  ProductTranslationFormState
>;

export type AdminProductPayload = {
  categories: ProductCategory[];
  colors: AdminColor[];
  products: AdminPageResult<AdminProduct>;
};

export type AdminProductListParams = {
  page: number;
  limit: number;
  keyword: string;
  categoryId: string;
};

export type ProductFormState = {
  id: number | null;
  name_en: string;
  slug: string;
  name_ko: string;
  search_keyword: string;
  description: string;
  detailed_description: string;
  note: string;
  price: string;
  discountRate: string;
  productLine: ProductLineValue | '';
  categoryId: string;
  colorIds: string[];
  defaultColorId: string;
  images: ProductImageFormState[];
  translations: ProductTranslationFormMap;
};

export type ProductImageFormState = {
  id: number | null;
  image_url: string;
  colorId: string;
  order: string;
  isMain: boolean;
};

export const emptyProductForm: ProductFormState = {
  id: null,
  name_en: '',
  slug: '',
  name_ko: '',
  search_keyword: '',
  description: '',
  detailed_description: '',
  note: '',
  price: '',
  discountRate: '0',
  productLine: '',
  categoryId: '',
  colorIds: [],
  defaultColorId: '',
  images: [],
  translations: {
    ko: { name: '', description: '', detailed_description: '', note: '' },
    en: { name: '', description: '', detailed_description: '', note: '' },
  },
};

export const createEmptyProductForm = (
  categories: ProductCategory[],
): ProductFormState => ({
  ...emptyProductForm,
  categoryId: String(categories[0]?.id ?? ''),
  colorIds: [],
  images: [],
  translations: {
    ko: { name: '', description: '', detailed_description: '', note: '' },
    en: { name: '', description: '', detailed_description: '', note: '' },
  },
});

const getProductTranslationForm = (
  product: AdminProduct,
  locale: ProductTranslationLocale,
): ProductTranslationFormState => {
  const translation = product.translations.find(
    (item) => item.locale === locale,
  );

  return {
    name:
      translation?.name ??
      (locale === 'en' ? product.name_en : (product.name_ko ?? '')),
    description: translation?.description ?? product.description,
    detailed_description:
      translation?.detailed_description ?? product.detailed_description ?? '',
    note: translation?.note ?? product.note ?? '',
  };
};

export const createProductFormFromItem = (
  product: AdminProduct,
): ProductFormState => ({
  id: product.id,
  name_en: product.name_en,
  slug: product.slug,
  name_ko: product.name_ko ?? '',
  search_keyword: product.search_keyword,
  description: product.description,
  detailed_description: product.detailed_description ?? '',
  note: product.note ?? '',
  price: String(product.price),
  discountRate: String(product.discountRate),
  productLine: product.productLine ?? '',
  categoryId: String(product.categoryId),
  colorIds: product.productColor.map((item) => String(item.colorId)),
  defaultColorId:
    product.productColor.find((item) => item.isDefault)?.colorId.toString() ??
    product.productColor[0]?.colorId.toString() ??
    '',
  images: product.images.map((image) => ({
    id: image.id,
    image_url: image.image_url,
    colorId: image.colorId ? String(image.colorId) : '',
    order: String(image.order),
    isMain: image.isMain,
  })),
  translations: {
    ko: getProductTranslationForm(product, 'ko'),
    en: getProductTranslationForm(product, 'en'),
  },
});
