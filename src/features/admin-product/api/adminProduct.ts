import { adminFetch } from '@shared/api/adminApi';

import type {
  AdminProduct,
  AdminProductListParams,
  AdminProductPayload,
  ProductFormState,
} from '../model/types';

const createProductPayload = (form: ProductFormState) => ({
  name_en: form.name_en,
  slug: form.slug,
  name_ko: form.name_ko,
  search_keyword: form.search_keyword,
  description: form.description,
  detailed_description: form.detailed_description,
  note: form.note,
  price: form.price,
  discountRate: form.discountRate,
  productLine: form.productLine,
  categoryId: Number(form.categoryId),
  colorIds: form.colorIds.map(Number),
  defaultColorId: form.defaultColorId ? Number(form.defaultColorId) : null,
  images: form.images
    .filter((image) => image.image_url.trim())
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      colorId: image.colorId ? Number(image.colorId) : null,
      order: Number(image.order || 0),
      isMain: image.isMain,
    })),
  translations: [
    { locale: 'ko' as const, ...form.translations.ko },
    { locale: 'en' as const, ...form.translations.en },
  ],
});

export const getAdminProducts = (params: AdminProductListParams) => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.keyword.trim()) {
    searchParams.set('keyword', params.keyword.trim());
  }

  if (params.categoryId) {
    searchParams.set('categoryId', params.categoryId);
  }

  return adminFetch<AdminProductPayload>(
    `/api/admin/products?${searchParams.toString()}`,
  );
};

export const saveAdminProduct = (form: ProductFormState) =>
  adminFetch<AdminProduct>(
    form.id ? `/api/admin/products/${form.id}` : '/api/admin/products',
    {
      method: form.id ? 'PUT' : 'POST',
      body: JSON.stringify(createProductPayload(form)),
    },
  );

export const deleteAdminProduct = (productId: number) =>
  adminFetch<{ id: number }>(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
