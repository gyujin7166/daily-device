# Daily Device 회고

## FSD 레이어 경계

FSD 구조를 적용하면서 `entities`와 `features`의 경계가 가장 어려웠습니다.

여러 화면에서 공유되는 도메인 타입, API, query key, mutation hook은 `entities`에 두고, 상품 목록, 상품 상세, 체크아웃, 상품평 작성처럼 사용자 액션과 화면 상태가 결합된 흐름은 `features`로 분리하는 기준을 세웠습니다.

다만 장바구니와 찜하기처럼 도메인 mutation 자체와 사용자 액션 UI가 강하게 연결된 기능은 경계가 특히 모호했습니다. 이 경우 mutation과 캐시 갱신 로직은 `entities`에 두고, 버튼 클릭 흐름과 화면별 조합은 `features`에서 가져다 쓰는 방식으로 정리했습니다.

## 서버 상태와 캐시 갱신

TanStack Query의 `useMutation`에서는 mutation 성공 직후 어떤 query를 무효화할지 기준을 세우는 것이 중요했습니다.

장바구니, 찜하기, 배송지, 상품평처럼 사용자 액션 이후 여러 화면의 데이터가 함께 바뀌는 경우에는 관련 query key를 명확히 분리하고, 성공 시점에 `invalidateQueries`를 호출해 서버 상태와 클라이언트 캐시가 어긋나지 않도록 했습니다.

장바구니의 수량 조절 및 삭제와 상품 찜하기는 낙관적 업데이트를 함께 사용해 UI 응답성을 유지했습니다. 특히 수량 변경처럼 빠르게 반복될 수 있는 액션은 마지막 요청만 최종 상태에 반영되도록 별도 revision 기준을 두었습니다.

## Suspense Query와 일반 Query 기준

TanStack Query의 `useSuspenseQuery`와 `useQuery`를 어떤 기준으로 나눌지도 고민했습니다.

서버 페이지네이션이 있는 주문 목록에 `useSuspenseQuery`를 사용하자, 캐시되지 않은 페이지로 이동할 때 Suspense fallback이 발생하며 컴포넌트가 다시 마운트되고 페이지 상태가 초기화되는 문제가 있었습니다.

반면 배송지처럼 전체 데이터를 한 번 가져와 클라이언트에서 slice 하는 화면은 query key가 바뀌지 않아 같은 문제가 발생하지 않았습니다.

이 경험을 바탕으로 마운트 시 반드시 필요한 초기 데이터나 독립 섹션에는 `useSuspenseQuery`를 사용하고, 페이지네이션, 정렬, 필터처럼 사용자 조작으로 서버 요청 파라미터가 바뀌는 화면에는 `useQuery`와 `placeholderData`를 사용해 기존 화면을 유지하며 부분 로딩을 처리하는 기준을 세웠습니다.

## 렌더링 전략

공개 상품 페이지는 정적 렌더링과 ISR로 제공하고, 사용자별 데이터는 클라이언트 Query와 보호 페이지의 서버 인증으로 분리했습니다.

`/products/[category]`, `/products/[category]/[slug]`는 `generateStaticParams()`로 빌드 시점에 경로를 생성하고 `revalidate`를 적용했습니다. 반면 `/my`, `/checkout`, `/admin`처럼 세션 검증이 필요한 페이지는 서버 컴포넌트에서 `auth()`를 호출해 동적 렌더링으로 처리했습니다.

초기에는 공통 쇼핑 레이아웃에서 장바구니와 위시리스트 prefetch를 위해 `auth()`를 호출했기 때문에 공개 페이지까지 동적 렌더링되는 문제가 있었습니다.

이를 제거하고 장바구니 개수, 위시리스트 여부 등 사용자별 UI는 `useSession()`과 TanStack Query로 클라이언트에서 처리하도록 분리했습니다.
