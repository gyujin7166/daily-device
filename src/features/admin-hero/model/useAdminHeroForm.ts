import { useCallback, useEffect, useMemo, useState } from 'react';

import { createHeroFormFromItem, emptyHeroForm } from './types';

import type {
  AdminHero,
  AdminHeroCategory,
  AdminHeroType,
  HeroFormState,
} from './types';

type UseAdminHeroFormParams = {
  heroTypes: AdminHeroType[];
  categories: AdminHeroCategory[];
};

export const useAdminHeroForm = ({
  heroTypes,
  categories,
}: UseAdminHeroFormParams) => {
  const [form, setForm] = useState<HeroFormState>(emptyHeroForm);
  const selectedHeroType = useMemo(
    () => heroTypes.find((type) => String(type.id) === form.heroTypeId),
    [form.heroTypeId, heroTypes],
  );
  const isProductHero = selectedHeroType?.name === 'product';
  const selectedTargetCategory = useMemo(
    () =>
      categories.find(
        (category) => String(category.id) === form.targetCategoryId,
      ),
    [categories, form.targetCategoryId],
  );

  const getFirstAvailableCategory = useCallback(
    () => categories[0],
    [categories],
  );

  const isHeroTypeDisabled = useCallback(
    (heroType: AdminHeroType) => {
      if (heroType.name === 'product') {
        return !getFirstAvailableCategory();
      }

      return false;
    },
    [getFirstAvailableCategory],
  );

  const getFirstAvailableHeroType = useCallback(
    () =>
      heroTypes.find((heroType) => {
        if (heroType.name === 'product') {
          return Boolean(getFirstAvailableCategory());
        }

        return true;
      }) ?? heroTypes[0],
    [getFirstAvailableCategory, heroTypes],
  );

  useEffect(() => {
    setForm((prev) => {
      const currentHeroType = heroTypes.find(
        (type) => String(type.id) === prev.heroTypeId,
      );
      const fallbackHeroType =
        currentHeroType &&
        (currentHeroType.name !== 'product' || getFirstAvailableCategory())
          ? currentHeroType
          : getFirstAvailableHeroType();
      const nextHeroTypeId = String(fallbackHeroType?.id ?? '');
      const nextHeroType = heroTypes.find(
        (type) => String(type.id) === nextHeroTypeId,
      );

      if (nextHeroType?.name !== 'product') {
        return {
          ...prev,
          heroTypeId: nextHeroTypeId,
          targetCategoryId: '',
        };
      }

      const nextCategory =
        categories.find(
          (category) => String(category.id) === prev.targetCategoryId,
        ) ?? categories[0];

      return {
        ...prev,
        heroTypeId: nextHeroTypeId,
        targetCategoryId: nextCategory ? String(nextCategory.id) : '',
        name_en: prev.name_en || nextCategory?.name_en || '',
        name_ko: prev.name_ko || nextCategory?.name_ko || '',
        translations: {
          ...prev.translations,
          en: {
            ...prev.translations.en,
            name: prev.translations.en.name || nextCategory?.name_en || '',
          },
          ko: {
            ...prev.translations.ko,
            name: prev.translations.ko.name || nextCategory?.name_ko || '',
          },
        },
      };
    });
  }, [
    categories,
    getFirstAvailableCategory,
    getFirstAvailableHeroType,
    heroTypes,
  ]);

  const resetForm = useCallback(() => {
    const defaultHeroType = getFirstAvailableHeroType();
    const defaultHeroTypeId = String(defaultHeroType?.id ?? '');
    const defaultCategory = getFirstAvailableCategory();

    setForm({
      ...emptyHeroForm,
      heroTypeId: defaultHeroTypeId,
      targetCategoryId:
        defaultHeroType?.name === 'product' && defaultCategory
          ? String(defaultCategory.id)
          : '',
      name_en:
        defaultHeroType?.name === 'product' && defaultCategory
          ? defaultCategory.name_en
          : '',
      name_ko:
        defaultHeroType?.name === 'product' && defaultCategory
          ? defaultCategory.name_ko
          : '',
      translations: {
        ko: {
          name:
            defaultHeroType?.name === 'product' && defaultCategory
              ? defaultCategory.name_ko
              : '',
          description: '',
          detailed_description: '',
        },
        en: {
          name:
            defaultHeroType?.name === 'product' && defaultCategory
              ? defaultCategory.name_en
              : '',
          description: '',
          detailed_description: '',
        },
      },
    });
  }, [getFirstAvailableCategory, getFirstAvailableHeroType]);

  const changeHeroType = useCallback(
    (heroTypeId: string) => {
      const nextHeroType = heroTypes.find(
        (type) => String(type.id) === heroTypeId,
      );
      const defaultCategory = getFirstAvailableCategory();

      setForm((prev) => {
        if (nextHeroType?.name !== 'product') {
          return {
            ...prev,
            heroTypeId,
            targetCategoryId: '',
          };
        }

        return {
          ...prev,
          heroTypeId,
          targetCategoryId: defaultCategory ? String(defaultCategory.id) : '',
          name_en: defaultCategory?.name_en ?? prev.name_en,
          name_ko: defaultCategory?.name_ko ?? prev.name_ko,
          translations: {
            ...prev.translations,
            en: {
              ...prev.translations.en,
              name: defaultCategory?.name_en ?? prev.translations.en.name,
            },
            ko: {
              ...prev.translations.ko,
              name: defaultCategory?.name_ko ?? prev.translations.ko.name,
            },
          },
        };
      });
    },
    [getFirstAvailableCategory, heroTypes],
  );

  const changeTargetCategory = useCallback(
    (targetCategoryId: string) => {
      const category = categories.find(
        (item) => String(item.id) === targetCategoryId,
      );

      setForm((prev) => ({
        ...prev,
        targetCategoryId,
        name_en: category?.name_en ?? prev.name_en,
        name_ko: category?.name_ko ?? prev.name_ko,
        translations: {
          ...prev.translations,
          en: {
            ...prev.translations.en,
            name: category?.name_en ?? prev.translations.en.name,
          },
          ko: {
            ...prev.translations.ko,
            name: category?.name_ko ?? prev.translations.ko.name,
          },
        },
      }));
    },
    [categories],
  );

  const editHero = useCallback(
    (hero: AdminHero) => {
      const nextForm = createHeroFormFromItem(hero);

      if (hero.heroType.name === 'product' && !nextForm.targetCategoryId) {
        const matchedCategory = categories.find(
          (category) => category.name_en === hero.name_en,
        );

        if (matchedCategory) {
          nextForm.targetCategoryId = String(matchedCategory.id);
          nextForm.name_en = matchedCategory.name_en;
        }
      }

      setForm(nextForm);
    },
    [categories],
  );

  return {
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
  };
};
