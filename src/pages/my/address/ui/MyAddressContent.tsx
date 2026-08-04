'use client';
import { IconPlus } from '@tabler/icons-react';
import { useFormatter, useTranslations } from 'next-intl';

import { useMyAddressManagement } from '@features/my/model/hooks/useMyAddressManagement';
import { MyPageScrollArea, MyPageSectionHeader } from '@features/my/ui';

import { AddressFormModal } from '@entities/address/ui';

import MyAddressEditModal from './MyAddressEditModal';
import MyAddressEmptyState from './MyAddressEmptyState';
import MyAddressListSection from './MyAddressListSection';
import MyAddressPagination from './MyAddressPagination';

export default function MyAddressContent() {
  const t = useTranslations('MyAddress.page');
  const format = useFormatter();
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
    isCreateModalOpen,
    isCreatingAddress,
    animatedAddressId,
    isDefaultUpdatePending,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleDelete,
    handlePageChange,
    handleSetDefault,
    handleSaveCreateAddress,
    handleInvalidCreateAddress,
    handleSaveEdit,
  } = useMyAddressManagement();

  return (
    <div className="w-full rounded-2xl lg:pl-4 dark:border-dark-border dark:bg-dark-bg">
      <MyPageSectionHeader
        label={t('label')}
        title={t('title')}
        description={t('description', {
          count: format.number(addresses.length),
        })}
        action={
          addresses.length > 0 ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
            >
              <IconPlus size={16} />
              {t('add')}
            </button>
          ) : null
        }
      />

      <MyPageScrollArea ref={listTopRef} className="scroll-mt-28">
        {addresses.length === 0 ? (
          <MyAddressEmptyState onCreate={openCreateModal} />
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

      {isCreateModalOpen ? (
        <AddressFormModal
          isSaving={isCreatingAddress}
          onClose={closeCreateModal}
          onCancel={closeCreateModal}
          onSave={handleSaveCreateAddress}
          onInvalid={handleInvalidCreateAddress}
        />
      ) : null}

      {editingAddress ? (
        <MyAddressEditModal
          key={editingAddress.id}
          editingAddress={editingAddress}
          isSaving={processingAction === 'edit'}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
        />
      ) : null}
    </div>
  );
}
