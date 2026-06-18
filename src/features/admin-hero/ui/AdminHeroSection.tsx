import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';

import { useAdminHeroForm } from '../model/useAdminHeroForm';
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
} from '../model/types';

const EMPTY_HERO_TYPES: AdminHeroType[] = [];
const EMPTY_CATEGORIES: AdminHeroCategory[] = [];
const EMPTY_HEROES: AdminHero[] = [];

const getHeroDisplayName = (hero: AdminHero) =>
  hero.name_ko || hero.name_en || hero.targetCategory?.name_ko || '-';

const getHeroSavedMessage = (hero: AdminHero, action: '추가' | '수정') =>
  `Hero ${action} 완료: ID ${hero.id} / 이름 ${getHeroDisplayName(hero)}`;

const getHeroDeletedMessage = (hero: AdminHero) =>
  `Hero 삭제 완료: ID ${hero.id} / 이름 ${getHeroDisplayName(hero)}`;

type AdminHeroSectionProps = {
  data?: AdminHeroPayload;
  isPending: boolean;
  canWriteAdmin: boolean;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
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
  const saveHeroMutation = useSaveAdminHeroMutation();
  const deleteHeroMutation = useDeleteAdminHeroMutation();
  const heroTypes = data?.heroTypes ?? EMPTY_HERO_TYPES;
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const heroes = data?.heroes ?? EMPTY_HEROES;
  const {
    form,
    selectedHeroType,
    selectedTargetCategory,
    isProductHero,
    setForm,
    resetForm,
    changeHeroType,
    changeTargetCategory,
    editHero,
    isHeroTypeDisabled,
  } = useAdminHeroForm({ heroTypes, categories });
  const isSaving = saveHeroMutation.isPending || deleteHeroMutation.isPending;
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [isCreatingHero, setIsCreatingHero] = useState(false);

  useEffect(() => {
    if (isCreatingHero) {
      return;
    }

    if (selectedHeroId !== null) {
      return;
    }

    if (heroes.length === 0) {
      setSelectedHeroId(null);
      return;
    }

    const firstHero = heroes[0];

    setSelectedHeroId(firstHero.id);
    editHero(firstHero);
  }, [editHero, heroes, isCreatingHero, selectedHeroId]);

  const handleResetForm = () => {
    resetForm();
    setSelectedHeroId(null);
    setIsCreatingHero(true);
  };

  const handleEditHero = (hero: AdminHero) => {
    editHero(hero);
    setSelectedHeroId(hero.id);
    setIsCreatingHero(false);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const action = form.id ? '수정' : '추가';
      const savedHero = await saveHeroMutation.mutateAsync(form);
      editHero(savedHero);
      setSelectedHeroId(savedHero.id);
      setIsCreatingHero(false);
      onMessage(getHeroSavedMessage(savedHero, action));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Hero 저장 실패');
    }
  };

  const handleDelete = async (hero: AdminHero) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!window.confirm('Hero를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteHeroMutation.mutateAsync(hero.id);
      if (selectedHeroId === hero.id) {
        const nextHero = heroes.find((item) => item.id !== hero.id);

        if (nextHero) {
          editHero(nextHero);
          setSelectedHeroId(nextHero.id);
        } else {
          resetForm();
          setSelectedHeroId(null);
        }

        setIsCreatingHero(false);
      }
      onMessage(getHeroDeletedMessage(hero));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Hero 삭제 실패');
    }
  };

  if (isPending) {
    return <AdminHeroLoading />;
  }

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[420px_1fr]">
      <AdminHeroFormSection
        form={form}
        heroTypes={heroTypes}
        categories={categories}
        selectedHeroType={selectedHeroType}
        selectedTargetCategory={selectedTargetCategory}
        isProductHero={isProductHero}
        isSaving={isSaving}
        setForm={setForm}
        onReset={handleResetForm}
        onSubmit={handleSubmit}
        onHeroTypeChange={changeHeroType}
        onTargetCategoryChange={changeTargetCategory}
        isHeroTypeDisabled={isHeroTypeDisabled}
      />

      <AdminHeroListSection
        heroes={heroes}
        selectedHeroId={selectedHeroId}
        isSaving={isSaving}
        onEdit={handleEditHero}
        onDelete={(hero) => void handleDelete(hero)}
      />
    </section>
  );
}

function AdminHeroLoading() {
  return (
    <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
      Hero 데이터를 불러오고 있습니다.
    </div>
  );
}
