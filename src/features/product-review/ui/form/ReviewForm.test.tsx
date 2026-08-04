import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ReviewForm from './ReviewForm';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  uploadPendingImages: vi.fn(),
  clearSelectedImages: vi.fn(),
  routerPush: vi.fn(),
  routerBack: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } } }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'ReviewWrite.validation' ? `validation.${key}` : key,
  useFormatter: () => ({
    number: (value: number) => String(value),
  }),
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
    back: mocks.routerBack,
  }),
}));

vi.mock('@shared/lib/toast', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock('../../queries/useUpsertProductReview', () => ({
  useUpsertProductReview: () => ({
    isPending: false,
    mutateAsync: mocks.mutateAsync,
  }),
}));

vi.mock('../../model/hooks/useUploadImage', () => ({
  default: () => ({
    selectedImages: [],
    isUploading: false,
    error: null,
    addImages: vi.fn(),
    uploadPendingImages: mocks.uploadPendingImages,
    removeImage: vi.fn(),
    clearSelectedImages: mocks.clearSelectedImages,
  }),
}));

const renderReviewForm = () =>
  render(<ReviewForm productId={10} orderItemId={20} initialReview={null} />);

beforeEach(() => {
  mocks.mutateAsync.mockResolvedValue({});
  mocks.uploadPendingImages.mockResolvedValue([]);
});

describe('ReviewForm', () => {
  it('필수 내용을 입력하지 않고 제출하면 각 필드 오류를 표시한다', async () => {
    const user = userEvent.setup();
    renderReviewForm();

    await user.click(screen.getByRole('button', { name: 'writeSubmit' }));

    expect(await screen.findByText('validation.titleRequired')).toBeVisible();
    expect(screen.getByText('validation.contentRequired')).toBeVisible();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('blur 이후에는 입력값이 유효해지는 즉시 오류를 제거한다', async () => {
    const user = userEvent.setup();
    renderReviewForm();
    const title = screen.getByPlaceholderText('titlePlaceholder');

    await user.type(title, '한');
    await user.tab();

    expect(await screen.findByText('validation.titleMin')).toBeVisible();

    await user.type(title, '글');

    await waitFor(() => {
      expect(screen.queryByText('validation.titleMin')).not.toBeInTheDocument();
    });
  });

  it('유효한 내용을 선택한 별점과 함께 제출한다', async () => {
    const user = userEvent.setup();
    renderReviewForm();

    await user.type(screen.getByPlaceholderText('titlePlaceholder'), '좋아요');
    await user.type(
      screen.getByPlaceholderText('contentPlaceholder'),
      '열 글자가 넘는 상품평 내용입니다.',
    );
    await user.click(
      screen.getAllByRole('button', { name: 'selectRating' })[3],
    );
    await user.click(screen.getByRole('button', { name: 'writeSubmit' }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        productId: 10,
        orderItemId: 20,
        rating: 4,
        title: '좋아요',
        content: '열 글자가 넘는 상품평 내용입니다.',
        images: [],
      });
    });
    expect(mocks.clearSelectedImages).toHaveBeenCalled();
    expect(mocks.routerPush).toHaveBeenCalled();
  });

  it('작성 내용이 변경된 경우에만 취소 확인을 요청한다', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderReviewForm();

    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(mocks.routerBack).toHaveBeenCalledTimes(1);

    await user.type(screen.getByPlaceholderText('titlePlaceholder'), '변경');
    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(confirm).toHaveBeenCalledWith('toast.leaveConfirm');
    expect(mocks.routerBack).toHaveBeenCalledTimes(1);
  });
});
