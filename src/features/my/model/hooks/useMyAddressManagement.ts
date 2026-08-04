import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { toAddressFormPayload } from '@entities/address/model/schema';
import type { AddressFormValues } from '@entities/address/model/schema';
import type { UserAddress } from '@entities/address/model/types';
import { useDeleteAddress } from '@entities/address/queries/useDeleteAddress';
import { useUpsertAddress } from '@entities/address/queries/useUpsertAddress';
import { useSuspenseUserAddresses } from '@entities/address/queries/useUserAddresses';

import { useScrollLock } from '@shared/hooks/useScrollLock';
import { getApiErrorMessage } from '@shared/lib/errors/apiErrorMessage';
import { toast } from '@shared/lib/toast';

import {
  DEFAULT_ADDRESS_ANIMATION_DURATION_MS,
  getMyAddressPaginationPages,
  MY_ADDRESSES_PER_PAGE,
} from '../addressManagement';

import type { AddressProcessingAction } from '../addressManagement';

export const useMyAddressManagement = () => {
  const t = useTranslations('MyAddress');
  const tApiError = useTranslations('Common.apiErrors');
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [animatedAddressId, setAnimatedAddressId] = useState<number | null>(
    null,
  );
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
      toast.success(t('toast.defaultSuccess'));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        tApiError,
        t('toast.defaultFailed'),
      );
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

    const confirmed = window.confirm(t('toast.deleteConfirm'));
    if (!confirmed) {
      return;
    }

    setProcessingAddressId(addressId);
    setProcessingAction('delete');
    try {
      await deleteAddress({ id: addressId });
      toast.success(t('toast.deleteSuccess'));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        tApiError,
        t('toast.deleteFailed'),
      );
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
  };

  const closeEditModal = () => {
    if (processingAction === 'edit') {
      return;
    }

    setEditingAddress(null);
  };

  const handleSaveEdit = async (formValues: AddressFormValues) => {
    if (!editingAddress || processingAddressId) {
      return;
    }

    const payload = toAddressFormPayload(formValues, editingAddress.isDefault);

    setProcessingAddressId(editingAddress.id);
    setProcessingAction('edit');
    try {
      await upsertAddress({
        id: editingAddress.id,
        ...payload,
      });
      toast.success(t('toast.editSuccess'));
      setEditingAddress(null);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        tApiError,
        t('toast.editFailed'),
      );
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

    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreatingAddress) {
      return;
    }

    setIsCreateModalOpen(false);
  };

  const handleSaveCreateAddress = async (
    formValues: AddressFormValues,
    isDefault: boolean,
  ) => {
    const payload = toAddressFormPayload(formValues, isDefault);

    try {
      setIsCreatingAddress(true);
      await upsertAddress(payload);
      toast.success(t('toast.createSuccess'));
      setIsCreateModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        tApiError,
        t('toast.createFailed'),
      );
      toast.error(message);
    } finally {
      setIsCreatingAddress(false);
    }
  };

  const handleInvalidCreateAddress = () => {
    toast.error(t('toast.createInvalid'));
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
  };
};
