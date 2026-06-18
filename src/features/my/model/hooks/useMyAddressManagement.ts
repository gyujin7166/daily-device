import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';

import {
  formatAddressPhone,
  normalizePhoneNumber,
  validateAddressField,
} from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';
import { useDeleteAddress } from '@entities/address/queries/useDeleteAddress';
import { useUpsertAddress } from '@entities/address/queries/useUpsertAddress';
import { useSuspenseUserAddresses } from '@entities/address/queries/useUserAddresses';

import { useScrollLock } from '@shared/hooks/useScrollLock';
import { toast } from '@shared/lib/toast';

import {
  DEFAULT_ADDRESS_ANIMATION_DURATION_MS,
  getMyAddressPaginationPages,
  MY_ADDRESSES_PER_PAGE,
} from '../addressManagement';

import { useMyAddressCreateForm } from './useMyAddressCreateForm';

import type {
  AddressEditForm,
  AddressProcessingAction,
} from '../addressManagement';

const createEmptyEditForm = (): AddressEditForm => ({
  recipientName: '',
  recipientPhone: '',
  address1: '',
  address2: '',
});

export const useMyAddressManagement = () => {
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const { data: addresses = [] } = useSuspenseUserAddresses();
  const { mutateAsync: upsertAddress } = useUpsertAddress();
  const { mutateAsync: deleteAddress } = useDeleteAddress();
  const [currentPage, setCurrentPage] = useState(1);
  const [processingAddressId, setProcessingAddressId] = useState<number | null>(
    null,
  );
  const [processingAction, setProcessingAction] =
    useState<AddressProcessingAction>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null,
  );
  const [editForm, setEditForm] = useState<AddressEditForm>(
    createEmptyEditForm(),
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [animatedAddressId, setAnimatedAddressId] = useState<number | null>(
    null,
  );
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { state: createFormState, actions: createFormActions } =
    useMyAddressCreateForm();

  useScrollLock(!!editingAddress || isCreateModalOpen);

  const totalPages = Math.max(
    1,
    Math.ceil(addresses.length / MY_ADDRESSES_PER_PAGE),
  );
  const pageNumbers = getMyAddressPaginationPages(currentPage, totalPages);
  const displayAddresses = addresses.slice(
    (currentPage - 1) * MY_ADDRESSES_PER_PAGE,
    currentPage * MY_ADDRESSES_PER_PAGE,
  );
  const isDefaultUpdatePending =
    processingAction === 'default' && processingAddressId !== null;

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const triggerDefaultAnimation = (addressId: number) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimatedAddressId(addressId);
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatedAddressId((currentId) =>
        currentId === addressId ? null : currentId,
      );
      animationTimeoutRef.current = null;
    }, DEFAULT_ADDRESS_ANIMATION_DURATION_MS);
  };

  const handleSetDefault = async (address: UserAddress) => {
    if (address.isDefault || processingAddressId) {
      return;
    }

    setProcessingAddressId(address.id);
    setProcessingAction('default');
    try {
      await upsertAddress({
        id: address.id,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        address1: address.address1,
        address2: address.address2 ?? undefined,
        isDefault: true,
      });
      triggerDefaultAnimation(address.id);
      toast.success('기본 배송지로 설정되었습니다.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '기본 배송지 설정에 실패했습니다.';
      toast.error(message);
    } finally {
      setProcessingAddressId(null);
      setProcessingAction(null);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (processingAddressId) {
      return;
    }

    const confirmed = window.confirm('이 배송지를 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }

    setProcessingAddressId(addressId);
    setProcessingAction('delete');
    try {
      await deleteAddress({ id: addressId });
      toast.success('배송지가 삭제되었습니다.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '배송지 삭제에 실패했습니다.';
      toast.error(message);
    } finally {
      setProcessingAddressId(null);
      setProcessingAction(null);
    }
  };

  const openEditModal = (address: UserAddress) => {
    if (processingAddressId) {
      return;
    }

    setEditingAddress(address);
    setEditForm({
      recipientName: address.recipientName,
      recipientPhone: formatAddressPhone(address.recipientPhone),
      address1: address.address1,
      address2: address.address2 ?? '',
    });
  };

  const closeEditModal = () => {
    if (processingAction === 'edit') {
      return;
    }

    setEditingAddress(null);
  };

  const handleEditFormChange =
    (field: keyof AddressEditForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmitEdit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingAddress || processingAddressId) {
      return;
    }

    const recipientName = editForm.recipientName.trim();
    const recipientPhone = normalizePhoneNumber(editForm.recipientPhone);
    const address1 = editForm.address1.trim();
    const address2 = editForm.address2.trim();

    if (!recipientName || !recipientPhone || !address1) {
      toast.error('수령인, 연락처, 주소를 입력해주세요.');
      return;
    }

    if (!validateAddressField(recipientPhone, 'phone_number')) {
      toast.error('연락처는 010으로 시작하는 11자리여야 합니다.');
      return;
    }

    setProcessingAddressId(editingAddress.id);
    setProcessingAction('edit');
    try {
      await upsertAddress({
        id: editingAddress.id,
        recipientName,
        recipientPhone,
        address1,
        address2: address2 || undefined,
        isDefault: editingAddress.isDefault,
      });
      toast.success('배송지가 수정되었습니다.');
      setEditingAddress(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '배송지 수정에 실패했습니다.';
      toast.error(message);
    } finally {
      setProcessingAddressId(null);
      setProcessingAction(null);
    }
  };

  const openCreateModal = () => {
    if (isCreatingAddress) {
      return;
    }

    createFormActions.reset();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreatingAddress) {
      return;
    }

    setIsCreateModalOpen(false);
    createFormActions.reset();
  };

  const handleSaveCreateAddress = async () => {
    const payload = createFormActions.getValidatedPayload();

    if (!payload) {
      toast.error('배송지 정보를 확인해주세요.');
      return;
    }

    try {
      setIsCreatingAddress(true);
      await upsertAddress(payload);
      toast.success('배송지가 저장되었습니다.');
      setIsCreateModalOpen(false);
      createFormActions.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '배송지 저장에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsCreatingAddress(false);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
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
    createAddressModalState: {
      title: '새 배송지 추가',
      isSaving: isCreatingAddress,
      showPostcode: createFormState.showPostcode,
      formState: createFormState.formState,
      validationState: createFormState.validationState,
      blurState: createFormState.blurState,
      address: createFormState.address,
      saveAsDefault: createFormState.saveAsDefault,
      isAddressReady: createFormState.isAddressReady,
    },
    createAddressModalActions: {
      onClose: closeCreateModal,
      onCancel: closeCreateModal,
      onSave: handleSaveCreateAddress,
      onShowPostcodeChange: createFormActions.setShowPostcode,
      onSaveAsDefaultChange: createFormActions.setSaveAsDefault,
      onAddressComplete: createFormActions.handleAddressComplete,
      onFieldChange: createFormActions.handleFieldChange,
      onFieldBlur: createFormActions.handleFieldBlur,
    },
    openCreateModal,
    openEditModal,
    closeEditModal,
    handleDelete,
    handlePageChange,
    handleSetDefault,
    handleSubmitEdit,
    handleEditFormChange,
  };
};
