# Daily Device 회고

README에는 현재 구현을 요약하고, 이 문서에는 프로젝트를 진행하며 마주친 문제와 선택의 근거를 정리했습니다.

## FSD 레이어 경계

FSD를 적용할 때 `entities`와 `features`의 경계가 가장 모호했습니다. 여러 화면이 공유하는 도메인 타입·API·query key·mutation은 `entities`에 두고, 상품 상세나 체크아웃처럼 사용자 액션과 화면 상태가 결합된 흐름은 `features`로 분리했습니다.

장바구니와 찜처럼 mutation이 액션 UI와 가까운 기능도 mutation과 캐시 갱신은 `entities`, 버튼 동작과 화면 조합은 `features`가 맡도록 정리했습니다. 이후 공유 도메인 로직을 다른 화면에서 재사용하면서도 페이지에만 필요한 UI 상태가 도메인 레이어로 섞이는 경우를 줄일 수 있었습니다.

## React Context에서 Zustand로 전환

장바구니·체크아웃·상품 필터·마이페이지 shell·Hero와 네비게이션 색상을 기능별 Context로 관리하자 Provider의 위치와 생명주기를 계속 추적해야 했고, 일부 값만 사용하는 컴포넌트도 Context 갱신의 영향을 받기 쉬웠습니다.

이 상태를 FSD slice 가까이의 Zustand store로 옮기고 컴포넌트가 필요한 상태와 action만 selector로 구독하게 했습니다. 서버 데이터는 TanStack Query, 공유하지 않는 짧은 UI 상태는 로컬 `useState`에 남겼습니다.

장바구니는 비회원 데이터, drawer, 수량, mutation 진행 상태를 별도 store로 나눴습니다. 비회원 데이터에는 `persist`를 적용하고 기존 Context의 배열 형식도 읽는 adapter를 두었으며, `skipHydration`과 동기화 컴포넌트로 저장소 복원 시점을 제어했습니다. Provider 구성이 단순해졌고 store의 상태 전이를 React 트리 없이 테스트할 수 있게 됐습니다.

## TanStack Query 캐시와 낙관적 업데이트

장바구니·찜·배송지·상품평 mutation 뒤 여러 화면의 데이터가 함께 달라져, query key를 도메인별로 나누고 성공 시 관련 캐시를 무효화했습니다.

장바구니 수량·삭제와 찜에는 낙관적 업데이트를 적용했습니다. `onMutate` 전에 `cancelQueries`로 진행 중인 요청을 취소하고 이전 캐시를 저장한 뒤, 실패하면 `onError`에서 롤백하도록 구성했습니다. 서버 응답을 기다리는 동안 UI를 먼저 갱신하면서도 빠른 연속 조작이나 background refetch가 이전 값을 덮는 경우를 줄였습니다.

## `useSuspenseQuery`와 `useQuery`

서버 페이지네이션을 사용하는 주문 목록에 `useSuspenseQuery`를 적용했을 때, 캐시되지 않은 페이지로 이동하면 fallback과 함께 컴포넌트가 재마운트되어 페이지 상태가 초기화됐습니다. 전체 주소를 한 번에 받아 클라이언트에서 나누는 배송지 화면은 query key가 바뀌지 않아 같은 문제가 없었습니다.

주문 목록은 `useQuery`와 `placeholderData`로 바꿔 이전 화면을 유지한 채 부분 로딩을 표시했습니다. 현재는 최초 마운트에 반드시 필요한 데이터나 독립 섹션에는 `useSuspenseQuery`, 페이지네이션·정렬·필터처럼 사용자 조작으로 파라미터가 바뀌는 화면에는 `useQuery`를 사용합니다.

## 상품 상세 prefetch와 hydration

상품 상세는 서버에서 상품 정보·이미지·상품평·추천 상품을 prefetch하고 `HydrationBoundary`로 클라이언트 캐시에 전달했습니다. 클라이언트 컴포넌트가 같은 query key를 재사용해 초기 진입 뒤의 중복 요청을 줄였습니다.

반면 찜 여부와 장바구니처럼 로그인 상태나 브라우저 저장소에 따라 달라지는 데이터까지 정적 결과에 포함하지 않고 클라이언트 조회로 분리했습니다. 공개 상품 정보와 사용자별 상태의 경계를 렌더링 전략과 query 구성에 함께 반영한 선택이었습니다.

## 정적/동적 렌더링 경계와 `auth()` 위치

공통 쇼핑 layout에서 장바구니와 위시리스트 데이터를 준비하던 구조는 그 안의 `auth()` 호출 때문에 공개 상품 페이지까지 정적 최적화되지 않았습니다.

layout에서 `auth()`를 제거하고 로그인 상태가 필요한 UI만 `useSession()` 기반 클라이언트 컴포넌트로 분리했습니다. 그 결과 상품·카테고리 페이지는 정적 생성 또는 ISR을 사용할 수 있었고, 체크아웃·마이페이지·관리자·API Route처럼 사용자별 권한과 요청 시점 데이터가 필요한 영역은 동적으로 유지했습니다. 이 변경의 렌더링 성능을 별도 수치로 측정하지는 않았습니다.

## GitHub Actions 정적 생성 병목 개선

Playwright용 production build에서 정적 생성 페이지가 약 391개까지 늘어났고, 상품·카테고리 경로가 원격 TiDB를 반복 조회하면서 workflow가 약 12분 걸렸습니다. DB 안정성을 위해 정적 생성 동시성을 낮춘 상태여서 timeout이나 병렬성만 조정하는 대신 E2E의 검증 범위에 필요한 경로를 확인했습니다.

`E2E_BUILD` 환경에서는 이미지·기본 색상·번역이 준비된 대표 상품과 카테고리 하나만 사전 생성하고, 로컬과 Vercel build는 전체 경로를 생성하도록 분리했습니다. 정적 생성 대상은 약 65개로 줄었고, 최적화 직후 workflow는 3분대로 단축됐습니다. 이후에는 원격 DB와 네트워크 상태에 따라 대체로 3~5분이 걸렸습니다.

이후 성공한 workflow에서도 Auth.js 세션과 상품평 조회가 첫 시도에 `P1001`, `P2024`로 실패하고 재시도로 통과하는 경우를 발견했습니다. build에 적용한 DB 연결 옵션이 Playwright runtime에는 전달되지 않은 것이 원인이었습니다. E2E DB URL 검증과 연결 옵션 구성을 공용 함수로 모으고, 기존 SSL 옵션을 유지하면서 중복 옵션을 교체하도록 했습니다.

DB 준비와 Playwright의 직접 연결이 같은 구성을 사용하게 한 뒤 전체 테스트가 재시도 없이 통과하는 것을 확인했습니다. 단순 성공 여부뿐 아니라 단계별 시간과 flaky 로그를 함께 본 덕분에 정적 생성 작업량과 연결 불안정 문제를 따로 해결할 수 있었습니다.

## React Hook Form과 Zod로 폼 이전

배송지·상품평·관리자 콘텐츠 폼을 `useState`와 기능별 hook으로 관리할 때 필드와 동적 배열이 늘면서 변경 handler와 오류 상태가 반복되고, 입력과 무관한 상위 UI까지 다시 렌더됐습니다.

React Hook Form과 `zodResolver`로 이전해 일반 입력은 `register`, 커스텀 입력은 `Controller`, 반복 필드는 `useFieldArray`로 연결했습니다. 배송지 폼에는 `FormProvider`, 파생 UI에는 `useWatch`를 사용했습니다. Zod schema에서 폼 값 타입을 추론해 타입과 검증 규칙이 따로 바뀌는 경우를 줄였고, 필드 단위 구독으로 입력과 무관한 목록이나 섹션의 렌더링 범위를 좁혔습니다.

이전 뒤에는 필수 입력·전화번호 정규화·동적 필드·커스텀 입력의 제출 흐름을 사용자 관점의 테스트로 확인했습니다.

클라이언트 검증은 입력 피드백에 사용하고, route param·query string·request body와 상품평 권한·주문 상태는 Route Handler에서 다시 확인합니다.

## 다크모드 FOUC 처리

테마를 `localStorage`에 저장하자 서버가 초기 테마를 알 수 없어 새로고침 직후 기본 테마가 잠깐 보였습니다. root layout의 `<head>`에 고정된 초기화 스크립트를 넣어 hydration 전에 `<html>` 클래스를 적용했습니다. `dangerouslySetInnerHTML`에는 사용자 입력이나 외부 데이터를 합성하지 않는 프로젝트 내부의 고정 스크립트만 사용했습니다.

## Cloudinary와 Vercel 이미지 최적화 중복 제거

Cloudinary에서 resize·`q_auto`·`f_auto` 변환을 마친 이미지를 `next/image`가 다시 최적화하면서 Vercel Image Transformations 사용량이 증가했고, 한도 초과 뒤 일부 이미지 요청이 402로 실패했습니다.

`minimumCacheTTL`을 늘리면 호출 빈도는 줄일 수 있지만 같은 이미지를 두 번 변환하는 구조는 남습니다. 그래서 캐시 시간보다 중복 변환을 제거하는 쪽이 원인에 가까운 해결이라고 판단했습니다. Cloudinary 이미지에만 조건부 `unoptimized`를 적용해 transformation URL을 브라우저가 직접 요청하게 하고, 비-Cloudinary 이미지는 기존 Next.js 최적화를 유지했습니다.

첫 점검에서는 Cloudinary URL 변환 함수의 사용처만 찾아 직접 렌더링하는 일부 경로를 놓쳤습니다. 이후 모든 `next/image` 사용처를 기준으로 다시 검사해 누락을 보완했습니다. 이 재점검까지 포함해 Cloudinary와 Vercel 양쪽에서 같은 이미지를 변환하던 경로를 정리했습니다.
