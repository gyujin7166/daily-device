import { adminFetch } from '@shared/api/adminApi';

import type {
  AdminHomePayload,
  AdminHomeSection,
  AdminHomeSectionItem,
  HomeSectionFormState,
  HomeSectionItemFormState,
} from '../model/types';

const createSectionPayload = (form: HomeSectionFormState) => ({
  eyebrow: form.eyebrow,
  title: form.title,
  subtitle: form.subtitle,
  displayOrder: Number(form.displayOrder || 0),
  isVisible: form.isVisible,
  translations: [
    { locale: 'ko' as const, ...form.translations.ko },
    { locale: 'en' as const, ...form.translations.en },
  ],
});

const createItemPayload = (form: HomeSectionItemFormState) => ({
  sectionId: form.sectionId,
  label: form.label,
  title: form.title,
  description: form.description,
  cta: form.cta,
  href: form.targetType === 'custom' ? form.href : null,
  targetCategoryId:
    form.targetType === 'category' && form.targetCategoryId
      ? Number(form.targetCategoryId)
      : null,
  targetProductId:
    form.targetType === 'product' && form.targetProductId
      ? Number(form.targetProductId)
      : null,
  image_url: form.image_url,
  imageAlt: form.imageAlt,
  displayOrder: Number(form.displayOrder || 0),
  isVisible: form.isVisible,
  layoutGroup: Number(form.layoutGroup || 0),
  layoutGroupClassName: form.layoutGroupClassName,
  layoutAreaClassName: form.layoutAreaClassName,
  labelPosition: form.labelPosition || null,
  imageClassName: form.imageClassName,
  translations: [
    { locale: 'ko' as const, ...form.translations.ko },
    { locale: 'en' as const, ...form.translations.en },
  ],
});

export const getAdminHomeSections = () =>
  adminFetch<AdminHomePayload>('/api/admin/home-sections');

export const updateAdminHomeSection = (form: HomeSectionFormState) =>
  adminFetch<AdminHomeSection>(`/api/admin/home-sections/${form.id}`, {
    method: 'PUT',
    body: JSON.stringify(createSectionPayload(form)),
  });

export const saveAdminHomeSectionItem = (form: HomeSectionItemFormState) =>
  adminFetch<AdminHomeSectionItem>(
    form.id
      ? `/api/admin/home-section-items/${form.id}`
      : '/api/admin/home-section-items',
    {
      method: form.id ? 'PUT' : 'POST',
      body: JSON.stringify(createItemPayload(form)),
    },
  );
