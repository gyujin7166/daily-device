import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  createEmptyProductForm,
  createProductFormFromItem,
} from '../model/types';
import {
  useDeleteAdminProductMutation,
  useSaveAdminProductMutation,
} from '../queries/useAdminProduct';

import AdminProductFormSection from './AdminProductFormSection';
import AdminProductListSection from './AdminProductListSection';

import type {
  AdminColor,
  AdminProduct,
  AdminProductListParams,
  AdminProductPayload,
  ProductCategory,
  ProductFormState,
} from '../model/types';

type AdminProductSectionProps = {
  data?: AdminProductPayload;
  params: AdminProductListParams;
  isPending: boolean;
  isFetching: boolean;
  canWriteAdmin: boolean;
  onKeywordChange: (keyword: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onPageChange: (page: number) => void;
  onMessage: (message: string) => void;
  onError: (error: unknown) => void;
  onReadOnlyAction: () => void;
};

const EMPTY_CATEGORIES: ProductCategory[] = [];
const EMPTY_COLORS: AdminColor[] = [];
const EMPTY_PRODUCTS: AdminProduct[] = [];

const getProductDisplayName = (product: AdminProduct) =>
  product.name_ko || product.name_en || product.slug || '-';

export default function AdminProductSection({
  data,
  params,
  isPending,
  isFetching,
  canWriteAdmin,
  onKeywordChange,
  onCategoryChange,
  onPageChange,
  onMessage,
  onError,
  onReadOnlyAction,
}: AdminProductSectionProps) {
  const t = useTranslations('AdminProduct.feedback');
  const saveProductMutation = useSaveAdminProductMutation();
  const deleteProductMutation = useDeleteAdminProductMutation();
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const colors = data?.colors ?? EMPTY_COLORS;
  const productPage = data?.products;
  const products = productPage?.items ?? EMPTY_PRODUCTS;
  const isSaving =
    saveProductMutation.isPending || deleteProductMutation.isPending;
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    if (isCreatingProduct || editingProduct || products.length === 0) {
      return;
    }

    setEditingProduct(products[0]);
  }, [editingProduct, isCreatingProduct, products]);

  const initialValues = editingProduct
    ? createProductFormFromItem(editingProduct)
    : createEmptyProductForm(categories);

  const handleResetForm = () => {
    setEditingProduct(null);
    setIsCreatingProduct(true);
    setFormVersion((version) => version + 1);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsCreatingProduct(false);
    setFormVersion((version) => version + 1);
  };

  const handleSubmit = async (formValues: ProductFormState) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const action = formValues.id ? t('editAction') : t('createAction');
      const savedProduct = await saveProductMutation.mutateAsync(formValues);
      setEditingProduct(savedProduct);
      setIsCreatingProduct(false);
      setFormVersion((version) => version + 1);
      onMessage(
        t('saveCompleted', {
          action,
          id: String(savedProduct.id),
          name: getProductDisplayName(savedProduct),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('saveFailed'));
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(product.id);
      if (editingProduct?.id === product.id) {
        const nextProduct =
          products.find((item) => item.id !== product.id) ?? null;
        setEditingProduct(nextProduct);
        setIsCreatingProduct(false);
        setFormVersion((version) => version + 1);
      }
      onMessage(
        t('deleteCompleted', {
          id: String(product.id),
          name: getProductDisplayName(product),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('deleteFailed'));
    }
  };

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        {t('loading')}
      </div>
    );
  }

  const formKey = `${isCreatingProduct ? 'new' : (editingProduct?.id ?? 'empty')}-${formVersion}`;

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <AdminProductFormSection
        key={formKey}
        initialValues={initialValues}
        categories={categories}
        colors={colors}
        isSaving={isSaving}
        onReset={handleResetForm}
        onSubmit={handleSubmit}
      />

      <AdminProductListSection
        params={params}
        productPage={productPage}
        products={products}
        categories={categories}
        selectedProductId={editingProduct?.id ?? null}
        isFetching={isFetching}
        isSaving={isSaving}
        onKeywordChange={onKeywordChange}
        onCategoryChange={onCategoryChange}
        onPageChange={onPageChange}
        onEdit={handleEditProduct}
        onDelete={(product) => void handleDelete(product)}
      />
    </section>
  );
}
