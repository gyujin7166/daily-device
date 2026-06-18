import { useCallback, useEffect, useMemo, useState } from 'react';

import { createProductFormFromItem, emptyProductForm } from './types';

import type {
  AdminColor,
  AdminProduct,
  ProductCategory,
  ProductFormState,
} from './types';

type UseAdminProductFormParams = {
  categories: ProductCategory[];
  colors: AdminColor[];
};

const getDefaultCategoryId = (categories: ProductCategory[]) =>
  String(categories[0]?.id ?? '');

export const useAdminProductForm = ({
  categories,
  colors,
}: UseAdminProductFormParams) => {
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId || getDefaultCategoryId(categories),
    }));
  }, [categories]);

  const resetForm = useCallback(() => {
    setForm({
      ...emptyProductForm,
      categoryId: getDefaultCategoryId(categories),
    });
  }, [categories]);

  const editProduct = useCallback((product: AdminProduct) => {
    setForm(createProductFormFromItem(product));
  }, []);

  const toggleFormColor = useCallback((colorId: string) => {
    setForm((prev) => {
      const isRemoving = prev.colorIds.includes(colorId);
      const colorIds = isRemoving
        ? prev.colorIds.filter((item) => item !== colorId)
        : [...prev.colorIds, colorId];
      const defaultColorId = colorIds.includes(prev.defaultColorId)
        ? prev.defaultColorId
        : (colorIds[0] ?? '');
      const images = isRemoving
        ? prev.images.map((image) =>
            image.colorId === colorId ? { ...image, colorId: '' } : image,
          )
        : prev.images;

      return {
        ...prev,
        colorIds,
        defaultColorId,
        images,
      };
    });
  }, []);

  const addProductImage = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: null,
          image_url: '',
          colorId: prev.colorIds.length > 0 ? prev.defaultColorId : '',
          order: String(prev.images.length),
          isMain: prev.images.length === 0,
        },
      ],
    }));
  }, []);

  const updateProductImage = useCallback(
    (index: number, patch: Partial<ProductFormState['images'][number]>) => {
      setForm((prev) => ({
        ...prev,
        images: prev.images.map((image, imageIndex) =>
          imageIndex === index ? { ...image, ...patch } : image,
        ),
      }));
    },
    [],
  );

  const updateProductImageOrder = useCallback(
    (index: number, value: string) => {
      const parsedValue = Number(value);
      const nextValue =
        value === '' || !Number.isFinite(parsedValue)
          ? ''
          : String(Math.max(0, Math.floor(parsedValue)));

      updateProductImage(index, { order: nextValue });
    },
    [updateProductImage],
  );

  const removeProductImage = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }, []);

  const selectedFormColors = useMemo(
    () => colors.filter((color) => form.colorIds.includes(String(color.id))),
    [colors, form.colorIds],
  );

  return {
    form,
    selectedFormColors,
    setForm,
    resetForm,
    editProduct,
    toggleFormColor,
    addProductImage,
    updateProductImage,
    updateProductImageOrder,
    removeProductImage,
  };
};
