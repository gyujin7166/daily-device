type SearchHeaderProps = {
  decodedQuery: string;
  totalItems: number;
  baseTotalItems?: number;
};

export default function SearchHeader({
  decodedQuery,
  totalItems,
  baseTotalItems,
}: SearchHeaderProps) {
  if (totalItems === 0 && (baseTotalItems ?? 0) === 0) return null;
  const safeQuery = decodedQuery?.trim() || '상품';

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <h1 className="text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-3xl dark:text-surface">
          &apos;{safeQuery}&apos; 검색 결과
        </h1>
        <p className="text-base font-semibold leading-6 text-ink dark:text-surface">
          전체 {totalItems.toLocaleString('ko-KR')}개
        </p>
      </div>
      <p className="mt-2 text-base text-muted dark:text-dark-muted">
        {safeQuery}와 관련된 상품을 모두 확인해보세요.
      </p>
    </div>
  );
}
