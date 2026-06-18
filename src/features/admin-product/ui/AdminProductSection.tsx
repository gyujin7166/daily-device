import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';

import { useAdminProductForm } from '../model/useAdminProductForm';
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
  onError: (message: string) => void;
  onReadOnlyAction: () => void;
};

const EMPTY_CATEGORIES: ProductCategory[] = [];
const EMPTY_COLORS: AdminColor[] = [];
const EMPTY_PRODUCTS: AdminProduct[] = [];

const getProductDisplayName = (product: AdminProduct) =>
  product.name_ko || product.name_en || product.slug || '-';

const getProductSavedMessage = (
  product: AdminProduct,
  action: '추가' | '수정',
) =>
  `상품 ${action} 완료: ID ${product.id} / 상품명: ${getProductDisplayName(product)}`;

const getProductDeletedMessage = (product: AdminProduct) =>
  `상품 삭제 완료: ID ${product.id} / 상품명: ${getProductDisplayName(product)}`;

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
  const saveProductMutation = useSaveAdminProductMutation();
  const deleteProductMutation = useDeleteAdminProductMutation();
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const colors = data?.colors ?? EMPTY_COLORS;
  const productPage = data?.products;
  const products = productPage?.items ?? EMPTY_PRODUCTS;
  const {
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
  } = useAdminProductForm({ categories, colors });
  const isSaving =
    saveProductMutation.isPending || deleteProductMutation.isPending;
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  useEffect(() => {
    if (isCreatingProduct) {
      return;
    }

    if (selectedProductId !== null) {
      return;
    }

    if (products.length === 0) {
      setSelectedProductId(null);
      return;
    }

    const firstProduct = products[0];

    setSelectedProductId(firstProduct.id);
    editProduct(firstProduct);
  }, [editProduct, isCreatingProduct, products, selectedProductId]);

  const handleResetForm = () => {
    resetForm();
    setSelectedProductId(null);
    setIsCreatingProduct(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    editProduct(product);
    setSelectedProductId(product.id);
    setIsCreatingProduct(false);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const action = form.id ? '수정' : '추가';
      const savedProduct = await saveProductMutation.mutateAsync(form);
      editProduct(savedProduct);
      setSelectedProductId(savedProduct.id);
      setIsCreatingProduct(false);
      onMessage(getProductSavedMessage(savedProduct, action));
    } catch (error) {
      onError(error instanceof Error ? error.message : '상품 저장 실패');
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!window.confirm('상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(product.id);
      if (selectedProductId === product.id) {
        const nextProduct = products.find((item) => item.id !== product.id);

        if (nextProduct) {
          editProduct(nextProduct);
          setSelectedProductId(nextProduct.id);
        } else {
          resetForm();
          setSelectedProductId(null);
        }

        setIsCreatingProduct(false);
      }
      onMessage(getProductDeletedMessage(product));
    } catch (error) {
      onError(error instanceof Error ? error.message : '상품 삭제 실패');
    }
  };

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        상품 데이터를 불러오고 있습니다.
      </div>
    );
  }

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <AdminProductFormSection
        form={form}
        categories={categories}
        colors={colors}
        selectedFormColors={selectedFormColors}
        isSaving={isSaving}
        setForm={setForm}
        onReset={handleResetForm}
        onSubmit={handleSubmit}
        onToggleColor={toggleFormColor}
        onAddImage={addProductImage}
        onUpdateImage={updateProductImage}
        onUpdateImageOrder={updateProductImageOrder}
        onRemoveImage={removeProductImage}
      />

      <AdminProductListSection
        params={params}
        productPage={productPage}
        products={products}
        categories={categories}
        selectedProductId={selectedProductId}
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
