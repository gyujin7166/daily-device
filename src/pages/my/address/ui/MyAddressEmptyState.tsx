import { IconMapPin } from '@tabler/icons-react';

export default function MyAddressEmptyState() {
  return (
    <div className="flex min-h-120 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <IconMapPin
        size={42}
        className="text-disabled-text dark:text-dark-muted"
      />
      <h2 className="mt-5 text-xl font-semibold text-ink dark:text-surface">
        저장된 배송지가 없습니다
      </h2>
      <p className="mt-2 text-sm text-muted dark:text-dark-muted">
        상단의 배송지 추가 버튼으로 새로운 배송지를 등록하세요.
      </p>
    </div>
  );
}
