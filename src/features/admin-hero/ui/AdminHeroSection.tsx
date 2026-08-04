import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { createEmptyHeroForm, createHeroFormFromItem } from '../model/types';
import {
  useDeleteAdminHeroMutation,
  useSaveAdminHeroMutation,
} from '../queries/useAdminHero';

import AdminHeroFormSection from './AdminHeroFormSection';
import AdminHeroListSection from './AdminHeroListSection';

import type {
  AdminHero,
  AdminHeroCategory,
  AdminHeroPayload,
  AdminHeroType,
  HeroFormState,
} from '../model/types';

const EMPTY_HERO_TYPES: AdminHeroType[] = [];
const EMPTY_CATEGORIES: AdminHeroCategory[] = [];
const EMPTY_HEROES: AdminHero[] = [];

const getHeroDisplayName = (hero: AdminHero) =>
  hero.name_ko || hero.name_en || hero.targetCategory?.name_ko || '-';

type AdminHeroSectionProps = {
  data?: AdminHeroPayload;
  isPending: boolean;
  canWriteAdmin: boolean;
  onMessage: (message: string) => void;
  onError: (error: unknown) => void;
  onReadOnlyAction: () => void;
};

export default function AdminHeroSection({
  data,
  isPending,
  canWriteAdmin,
  onMessage,
  onError,
  onReadOnlyAction,
}: AdminHeroSectionProps) {
  const t = useTranslations('AdminHero.feedback');
  const saveHeroMutation = useSaveAdminHeroMutation();
  const deleteHeroMutation = useDeleteAdminHeroMutation();
  const heroTypes = data?.heroTypes ?? EMPTY_HERO_TYPES;
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const heroes = data?.heroes ?? EMPTY_HEROES;
  const isSaving = saveHeroMutation.isPending || deleteHeroMutation.isPending;
  const [editingHero, setEditingHero] = useState<AdminHero | null>(null);
  const [isCreatingHero, setIsCreatingHero] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    if (isCreatingHero || editingHero || heroes.length === 0) {
      return;
    }

    setEditingHero(heroes[0]);
  }, [editingHero, heroes, isCreatingHero]);

  const initialValues = editingHero
    ? createHeroFormFromItem(editingHero, categories)
    : createEmptyHeroForm(heroTypes, categories);

  const handleResetForm = () => {
    setEditingHero(null);
    setIsCreatingHero(true);
    setFormVersion((version) => version + 1);
  };

  const handleEditHero = (hero: AdminHero) => {
    setEditingHero(hero);
    setIsCreatingHero(false);
    setFormVersion((version) => version + 1);
  };

  const handleSubmit = async (formValues: HeroFormState) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const action = formValues.id ? t('editAction') : t('createAction');
      const savedHero = await saveHeroMutation.mutateAsync(formValues);
      setEditingHero(savedHero);
      setIsCreatingHero(false);
      setFormVersion((version) => version + 1);
      onMessage(
        t('saveCompleted', {
          action,
          id: String(savedHero.id),
          name: getHeroDisplayName(savedHero),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('saveFailed'));
    }
  };

  const handleDelete = async (hero: AdminHero) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await deleteHeroMutation.mutateAsync(hero.id);
      if (editingHero?.id === hero.id) {
        const nextHero = heroes.find((item) => item.id !== hero.id) ?? null;
        setEditingHero(nextHero);
        setIsCreatingHero(false);
        setFormVersion((version) => version + 1);
      }
      onMessage(
        t('deleteCompleted', {
          id: String(hero.id),
          name: getHeroDisplayName(hero),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('deleteFailed'));
    }
  };

  if (isPending) {
    return <AdminHeroLoading />;
  }

  const formKey = `${isCreatingHero ? 'new' : (editingHero?.id ?? 'empty')}-${formVersion}`;

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[420px_1fr]">
      <AdminHeroFormSection
        key={formKey}
        initialValues={initialValues}
        heroTypes={heroTypes}
        categories={categories}
        isSaving={isSaving}
        onReset={handleResetForm}
        onSubmit={handleSubmit}
      />

      <AdminHeroListSection
        heroes={heroes}
        selectedHeroId={editingHero?.id ?? null}
        isSaving={isSaving}
        onEdit={handleEditHero}
        onDelete={(hero) => void handleDelete(hero)}
      />
    </section>
  );
}

function AdminHeroLoading() {
  const t = useTranslations('AdminHero.feedback');

  return (
    <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
      {t('loading')}
    </div>
  );
}
