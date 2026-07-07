import { adminFetch } from '@shared/api/adminApi';

import type {
  AdminHero,
  AdminHeroPayload,
  HeroFormState,
} from '../model/types';

const createHeroPayload = (form: HeroFormState) => ({
  name_en: form.name_en,
  name_ko: form.name_ko,
  heroTypeId: Number(form.heroTypeId),
  targetCategoryId: form.targetCategoryId
    ? Number(form.targetCategoryId)
    : null,
  image_url: form.image_url,
  image_width: form.image_width,
  image_height: form.image_height,
  description: form.description,
  detailed_description: form.detailed_description,
  position: form.position,
  isDefault: form.isDefault,
  textTone: form.textTone,
  navTone: form.navTone,
  overlayTone: form.overlayTone,
});

export const getAdminHeroes = () =>
  adminFetch<AdminHeroPayload>('/api/admin/heroes');

export const saveAdminHero = (form: HeroFormState) =>
  adminFetch<AdminHero>(
    form.id ? `/api/admin/heroes/${form.id}` : '/api/admin/heroes',
    {
      method: form.id ? 'PUT' : 'POST',
      body: JSON.stringify(createHeroPayload(form)),
    },
  );

export const deleteAdminHero = (heroId: number) =>
  adminFetch<{ id: number }>(`/api/admin/heroes/${heroId}`, {
    method: 'DELETE',
  });
