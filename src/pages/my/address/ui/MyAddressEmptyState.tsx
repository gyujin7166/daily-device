import { IconPlus } from '@tabler/icons-react';

import MyPageEmptyStatePanel from '@widgets/my-page-empty/ui/MyPageEmptyStatePanel';

type MyAddressEmptyStateProps = {
  onCreate: () => void;
};

export default function MyAddressEmptyState({
  onCreate,
}: MyAddressEmptyStateProps) {
  return (
    <MyPageEmptyStatePanel
      title="저장된 배송지가 없어요"
      description="자주 사용하는 배송지를 등록해두면 주문할 때 더 빠르게 선택할 수 있습니다."
      iconVariant="address"
      action={
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-surface shadow-[0_14px_26px_-18px_rgba(37,99,235,0.75)] transition-colors hover:bg-primary-hover"
        >
          <IconPlus size={16} />
          배송지 추가
        </button>
      }
    />
  );
}
