'use client';
import { IconPlus } from '@tabler/icons-react';

import { useMyAddressManagement } from '@features/my/model/hooks/useMyAddressManagement';
import { MyPageScrollArea, MyPageSectionHeader } from '@features/my/ui';

import { AddressFormModal } from '@entities/address/ui';

import MyAddressEditModal from './MyAddressEditModal';
import MyAddressEmptyState from './MyAddressEmptyState';
import MyAddressListSection from './MyAddressListSection';
import MyAddressPagination from './MyAddressPagination';

export default function MyAddressContent() {
  const {
    addresses,
    displayAddresses,
    currentPage,
    pageNumbers,
    totalPages,
    listTopRef,
    processingAddressId,
    processingAction,
    editingAddress,
    editForm,
    isCreateModalOpen,
    animatedAddressId,
    isDefaultUpdatePending,
    createAddressModalState,
    createAddressModalActions,
    openCreateModal,
    openEditModal,
    closeEditModal,
    handleDelete,
    handlePageChange,
    handleSetDefault,
    handleSubmitEdit,
    handleEditFormChange,
  } = useMyAddressManagement();

  return (
    <div className="w-full rounded-2xl lg:pl-4 dark:border-dark-border dark:bg-dark-bg">
      <MyPageSectionHeader
        label="ADDRESSES"
        title="배송지 관리"
        description={`저장된 배송지 ${addresses.length}개`}
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
          >
            <IconPlus size={16} />
            배송지 추가
          </button>
        }
      />

      <MyPageScrollArea ref={listTopRef} className="scroll-mt-28">
        {addresses.length === 0 ? (
          <MyAddressEmptyState />
        ) : (
          <MyAddressListSection
            addresses={displayAddresses}
            processingAddressId={processingAddressId}
            animatedAddressId={animatedAddressId}
            isDefaultUpdatePending={isDefaultUpdatePending}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        )}
      </MyPageScrollArea>

      <MyAddressPagination
        totalPages={totalPages}
        currentPage={currentPage}
        pageNumbers={pageNumbers}
        disabled={isDefaultUpdatePending}
        onPageChange={handlePageChange}
      />

      <AddressFormModal
        isOpen={isCreateModalOpen}
        state={createAddressModalState}
        actions={createAddressModalActions}
      />

      <MyAddressEditModal
        editingAddress={editingAddress}
        editForm={editForm}
        isSaving={processingAction === 'edit'}
        onClose={closeEditModal}
        onSubmit={handleSubmitEdit}
        onFieldChange={handleEditFormChange}
      />
    </div>
  );
}
