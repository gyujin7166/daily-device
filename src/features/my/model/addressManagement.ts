export type AddressProcessingAction = 'default' | 'delete' | 'edit' | null;

export const DEFAULT_ADDRESS_ANIMATION_DURATION_MS = 1200;
export const MY_ADDRESSES_PER_PAGE = 5;
const MY_ADDRESS_PAGE_WINDOW_SIZE = 5;

export const getMyAddressPaginationPages = (
  currentPage: number,
  totalPages: number,
) => {
  const halfWindow = Math.floor(MY_ADDRESS_PAGE_WINDOW_SIZE / 2);
  const maxStartPage = Math.max(
    1,
    totalPages - MY_ADDRESS_PAGE_WINDOW_SIZE + 1,
  );
  const startPage = Math.min(
    Math.max(1, currentPage - halfWindow),
    maxStartPage,
  );
  const endPage = Math.min(
    totalPages,
    startPage + MY_ADDRESS_PAGE_WINDOW_SIZE - 1,
  );

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
};
