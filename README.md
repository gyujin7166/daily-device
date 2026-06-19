# Daily Device

Next.js App Router 기반 이커머스 포트폴리오 프로젝트입니다.

라우팅은 Next.js App Router의 `app/`에서 담당하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 `src/` 하위 레이어로 분리했습니다.

## 데모 안내

이 프로젝트는 포트폴리오 목적의 데모 서비스입니다. 실제 상품 판매, 배송, 결제 처리는 이루어지지 않으며, Toss Payments는 테스트 결제 환경을 사용합니다.

데모 사용 시 실제 개인정보 입력은 권장하지 않습니다. 회원가입, 배송지, 주문, 상품평 기능은 이커머스 흐름 구현을 보여주기 위한 목적으로 제공됩니다.

## 사용 기술

### Frontend

- Next.js 16 (React 19)
- TypeScript 5
- Tailwind CSS 4
- TanStack Query 5

### Backend / Database

- Next.js Route Handlers
- Prisma 6
- TiDB / MySQL

### Auth / Validation

- Auth.js (Next-auth v5)
- Zod

### Infra / External

- Cloudinary
- Toss Payments

## 구현한 기능

- 상품 목록, 카테고리, 상세 페이지
- 상품 필터, 정렬, 검색, 추천 검색어, 무한 스크롤
- 색상 선택과 색상별 이미지 표시
- 장바구니, 바로 구매, 체크아웃, Toss Payments 테스트 결제
- 주문 취소, 배송 완료 처리, 결제 대기 주문 만료 처리
- 배송지 등록, 수정, 삭제
- 주문 목록과 주문 상세
- 상품평 작성, 수정, 숨김 처리, 평점 분포, 이미지 갤러리
- 상품평 피드백
- 상품, Hero, 상품평 이미지 업로드와 이미지 서빙
- 찜한 상품 추가/삭제, 전체 비우기, 마이페이지 찜 목록
- 다크모드
- Daum 우편번호 검색을 이용한 배송지 주소 입력
- 배송지/상품평 입력 폼 유효성 검사
- 로그인, 소셜 로그인, 데모 로그인
- 관리자 페이지
  - Hero 추가/수정/삭제, 문구 색상, 네비바 색상, 오버레이, 위치 관리
  - 상품 추가/수정/삭제
  - 홈 섹션과 홈 카드 콘텐츠 관리
  - 상품평 공개/숨김 관리

## 프로젝트에서 신경 쓴 부분

- Next.js App Router는 라우팅 엔트리로만 두고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 분리했습니다.
- API Route에서는 요청 params, query, body를 Zod schema로 검증하고, 클라이언트 폼에서는 즉시 피드백을 위한 별도 검증 로직을 적용했습니다.
- TanStack Query의 prefetch/hydration과 query key 분리로 서버 초기 데이터와 클라이언트 캐시를 관리했습니다.
- 장바구니와 찜하기는 낙관적 업데이트를 적용해 사용자 조작에 즉시 반응하도록 했습니다.
- 주문은 `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED` 상태를 기준으로 결제/취소/만료 흐름을 분리했고, 실제 배송 상태를 추적할 수 없는 포트폴리오 환경에서는 사용자의 수취확인으로 상품평 작성 가능 상태가 되도록 설계했습니다.
- 관리자 페이지는 일반 계정도 데이터를 볼 수 있지만, 수정은 `ADMIN` 역할을 가진 계정만 가능하게 하고 상품평 작성자 정보는 권한에 따라 마스킹했습니다.
- Cloudinary를 이미지 서버로 사용하고, 서버에서 업로드 경로와 서명을 생성해 상품, Hero, 상품평 이미지를 대상별 폴더와 public id 규칙에 맞춰 업로드합니다.
- 상품과 Hero 이미지는 AI로 생성한 뒤, 상품 seed 이미지는 Python `rembg` 라이브러리로 배경을 제거해 알파 채널이 있는 WebP 이미지로 가공했습니다.
- base64 blurDataURL을 사용해 이미지 로딩 중 빈 화면 노출과 레이아웃 흔들림을 줄였습니다.
- seed image manifest를 기준으로 Cloudinary 업로드 결과와 DB seed 데이터를 연결했습니다.
- DB에 저장된 이미지 URL을 기준으로 렌더링하고, 색상별 이미지가 없으면 기본 이미지로 fallback합니다.
- 로딩, 빈 상태, 에러 상태를 페이지 단위로 분리해 주요 사용자 흐름이 끊기지 않도록 했습니다.
- 기능이 아직 연결되지 않은 UI는 클릭 시 `현재 준비 중인 기능입니다.` 토스트를 표시해, 사용자가 비활성 상태인지 오류인지 혼동하지 않도록 처리했습니다.
- 배송지 입력은 Daum 우편번호 검색과 상세주소 입력을 분리해 주소 입력 오류를 줄였습니다.
- 상품평 작성은 구매한 주문 상품 기준으로만 가능하도록 서버에서 권한과 주문 상태를 확인했습니다.

## 회고

FSD 구조를 적용하면서 `entities`와 `features`의 경계가 가장 어려웠습니다. 여러 화면에서 공유되는 도메인 타입, API, query key, mutation hook은 `entities`에 두고, 상품 목록, 상품 상세, 체크아웃, 상품평 작성처럼 사용자 액션과 화면 상태가 결합된 흐름은 `features`로 분리하는 기준을 세웠습니다.

다만 장바구니와 찜하기처럼 도메인 mutation 자체와 사용자 액션 UI가 강하게 연결된 기능은 경계가 특히 모호했습니다. 이 경우 mutation과 캐시 갱신 로직은 `entities`에 두고, 버튼 클릭 흐름과 화면별 조합은 `features`에서 가져다 쓰는 방식으로 정리했습니다.

TanStack Query의 `useMutation`에서는 mutation 성공 직후 어떤 query를 무효화할지 기준을 세우는 것이 중요했습니다. 장바구니, 찜하기, 배송지, 상품평처럼 사용자 액션 이후 여러 화면의 데이터가 함께 바뀌는 경우에는 관련 query key를 명확히 분리하고, 성공 시점에 `invalidateQueries`를 호출해 서버 상태와 클라이언트 캐시가 어긋나지 않도록 했습니다. 장바구니의 수량 조절 및 삭제와 상품 찜하기는 낙관적 업데이트를 함께 사용해 UI 응답성을 유지했습니다.

TanStack Query의 `useSuspenseQuery`와 `useQuery`를 어떤 기준으로 나눌지도 고민했습니다. 서버 페이지네이션이 있는 주문 목록에 `useSuspenseQuery`를 사용하자, 캐시되지 않은 페이지로 이동할 때 Suspense fallback이 발생하며 컴포넌트가 다시 마운트되고 페이지 상태가 초기화되는 문제가 있었습니다. 반면 배송지처럼 전체 데이터를 한 번 가져와 클라이언트에서 slice 하는 화면은 query key가 바뀌지 않아 같은 문제가 발생하지 않았습니다.

이 경험을 바탕으로 마운트 시 반드시 필요한 초기 데이터나 독립 섹션에는 `useSuspenseQuery`를 사용하고, 페이지네이션/정렬/필터처럼 사용자 조작으로 서버 요청 파라미터가 바뀌는 화면에는 `useQuery`와 `placeholderData`를 사용해 기존 화면을 유지하며 부분 로딩을 처리하는 기준을 세웠습니다.

공개 상품 페이지는 정적 렌더링/ISR로 제공하고, 사용자별 데이터는 클라이언트 Query와 보호 페이지의 서버 인증으로 분리했습니다. `/products/[category]`, `/products/[category]/[slug]`는 `generateStaticParams()`로 빌드 시점에 경로를 생성하고 `revalidate`를 적용했습니다. 반면 `/my`, `/checkout`, `/admin`처럼 세션 검증이 필요한 페이지는 서버 컴포넌트에서 `auth()`를 호출해 동적 렌더링으로 처리했습니다.

초기에는 공통 쇼핑 레이아웃에서 장바구니/위시리스트 prefetch를 위해 `auth()`를 호출했기 때문에 공개 페이지까지 동적 렌더링되는 문제가 있었습니다. 이를 제거하고 장바구니 개수, 위시리스트 여부 등 사용자별 UI는 `useSession()`과 TanStack Query로 클라이언트에서 처리하도록 분리했습니다.

## 폴더 구조

```txt
app/                  Next.js 라우팅 엔트리
src/app/              Provider 등 앱 조립 코드
src/pages/            페이지 단위 화면 조합
src/widgets/          여러 페이지에서 재사용되는 큰 UI
src/features/         기능 단위 UI와 로직
src/entities/         도메인 단위 타입, API, UI
src/shared/           공용 UI, 유틸, 상수
src/app/api-routes/   API Route 실제 구현
prisma/               Prisma schema와 seed, seed 이미지 업로드 스크립트
public/               로고, fallback, 홈/카테고리 등 정적 UI 이미지
```

## 실행

```bash
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

```txt
http://localhost:3000
```

## DB 관리

포트폴리오 목적의 프로젝트라 migration 파일은 Git에 포함하지 않고, `schema.prisma`와 `db push`기준으로 관리합니다.
실서비스라면 migration 기반으로 DB 변경 이력을 관리하는 것이 적절합니다.

```bash
npx prisma db push
npm run db:seed
```

상품 seed 이미지까지 Cloudinary에 올려 DB에 반영할 때는 아래 흐름을 사용합니다.

```bash
npm run upload:seed-images
npm run db:seed
```

- `.seed-images/`: Cloudinary에 업로드할 seed 이미지 루트
- `upload:seed-images`: Cloudinary 업로드 후 seed image manifest 갱신
- `db:seed`: manifest 기준으로 상품 이미지와 색상별 이미지 반영

## 관리자 페이지

```txt
/admin
```

관리자 권한은 DB의 `User.role` 값으로 판단합니다.

- `USER`: 관리자 페이지 조회만 가능
- `ADMIN`: 추가, 수정, 삭제 가능

데모 계정은 관리자 페이지를 읽기 전용으로 조회할 수 있습니다.
데이터 추가/수정/삭제는 ADMIN 권한 계정에서만 가능합니다.

## 배포

Vercel로 배포했습니다.

- 사이트: https://...
- 관리자 페이지: https://.../admin
- 데모 로그인: 로그인 페이지의 데모 로그인 버튼 사용

## 검증

작업 후 아래 명령으로 확인했습니다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```
