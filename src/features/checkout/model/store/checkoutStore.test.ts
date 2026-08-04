import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialAddressFormState } from '@entities/address/model/form';

import { selectIsCheckoutFormValid, useCheckoutStore } from './checkoutStore';

describe('useCheckoutStore', () => {
  beforeEach(() => {
    useCheckoutStore.getState().actions.resetCheckoutState();
  });

  it('주소 폼을 함수형 업데이트로 변경한다', () => {
    act(() => {
      useCheckoutStore.getState().actions.setFormState((previous) => ({
        ...previous,
        name: '홍길동',
      }));
    });

    expect(useCheckoutStore.getState().formState).toEqual({
      ...createInitialAddressFormState(),
      name: '홍길동',
    });
  });

  it('확정된 배송지 값에서 폼 유효성을 계산한다', () => {
    expect(selectIsCheckoutFormValid(useCheckoutStore.getState())).toBe(false);

    act(() => {
      useCheckoutStore.getState().actions.setFormState({
        name: '홍길동',
        phone_number: '01012345678',
        address_1: '서울시 테스트 주소',
        address_2: '',
      });
    });

    expect(selectIsCheckoutFormValid(useCheckoutStore.getState())).toBe(true);
  });

  it('주소 선택과 모달 상태를 초기값으로 되돌린다', () => {
    act(() => {
      const actions = useCheckoutStore.getState().actions;
      actions.setSelectedAddressId(7);
      actions.setIsAddressModalOpen(true);
      actions.setAddressModalMode('new');
      actions.setEditingAddressId(7);
      actions.resetCheckoutState();
    });

    expect(useCheckoutStore.getState()).toMatchObject({
      selectedAddressId: null,
      isAddressModalOpen: false,
      addressModalMode: 'saved',
      editingAddressId: null,
    });
  });
});
