import { IconSearch } from '@tabler/icons-react';

type NoSearchResultsProps = {
  searchTerm: string;
};

export default function NoSearchResults({ searchTerm }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 translate-y-1/2">
      <div className="mb-8">
        <IconSearch
          className="text-line dark:text-dark-muted"
          size={64}
          strokeWidth={1.5}
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">
        &apos;{searchTerm}&apos;에 대한 검색 결과가 없습니다.
      </h2>
      <p className="text-muted text-center max-w-md mb-8 dark:text-dark-muted">
        다른 용어로 검색해보세요.
      </p>
    </div>
  );
}
