type NullableSlug = string | null | undefined;

const normalizeSlug = (slug: NullableSlug) => {
  const normalizedSlug = slug?.trim();

  return normalizedSlug && normalizedSlug.length > 0
    ? normalizedSlug
    : undefined;
};

const PRODUCT_LIST_HREF = '/products';

/**
 * 상품/카테고리 slug가 비어 있으면 깨진 상세 URL 대신 목록 URL로 보낸다.
 * 관리자 홈 카드처럼 target이 선택 사항인 곳에서 같은 fallback 정책을 공유한다.
 */
export const getCategoryHref = (categorySlug: NullableSlug) => {
  const normalizedCategorySlug = normalizeSlug(categorySlug);

  return normalizedCategorySlug
    ? `${PRODUCT_LIST_HREF}/${normalizedCategorySlug}`
    : PRODUCT_LIST_HREF;
};

/**
 * 카테고리와 상품 slug가 모두 있을 때만 상세 경로를 만든다.
 * 하나라도 없으면 사용자를 404 대신 상품 목록으로 돌려보낸다.
 */
export const getProductHref = ({
  categorySlug,
  productSlug,
}: {
  categorySlug: NullableSlug;
  productSlug: NullableSlug;
}) => {
  const normalizedCategorySlug = normalizeSlug(categorySlug);
  const normalizedProductSlug = normalizeSlug(productSlug);

  return normalizedCategorySlug && normalizedProductSlug
    ? `${PRODUCT_LIST_HREF}/${normalizedCategorySlug}/${normalizedProductSlug}`
    : PRODUCT_LIST_HREF;
};

/**
 * href 자체가 선택 사항인 UI에서 fallback 링크 생성을 피하기 위해 undefined를 반환한다.
 */
export const getOptionalProductHref = ({
  categorySlug,
  productSlug,
}: {
  categorySlug: NullableSlug;
  productSlug: NullableSlug;
}) => {
  const normalizedCategorySlug = normalizeSlug(categorySlug);
  const normalizedProductSlug = normalizeSlug(productSlug);

  return normalizedCategorySlug && normalizedProductSlug
    ? getProductHref({
        categorySlug: normalizedCategorySlug,
        productSlug: normalizedProductSlug,
      })
    : undefined;
};
