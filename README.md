# Daily Device

Next.js App Router 기반 이커머스 포트폴리오 프로젝트입니다.

라우팅은 Next.js App Router의 `app/`에서 담당하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 `src/` 하위 레이어로 분리했습니다.

## 데모 안내

이 프로젝트는 포트폴리오 목적의 데모 서비스입니다. 실제 상품 판매, 배송, 결제 처리는 이루어지지 않으며, Toss Payments는 테스트 결제 환경을 사용합니다.

데모 사용 시 실제 개인정보 입력은 권장하지 않습니다. 회원가입, 배송지, 주문, 상품평 기능은 이커머스 흐름 구현을 보여주기 위한 목적으로 제공됩니다.

- 실제 결제 승인과 배송 처리를 대체하는 데모 흐름을 포함합니다.
- 관리자 페이지는 데모 계정으로 조회할 수 있지만, 데이터 변경은 `ADMIN` 권한 계정에서만 가능합니다.
- 기능이 아직 연결되지 않은 일부 UI는 안내 토스트로 처리합니다.

## 배포

Vercel로 배포했습니다.

- 사이트: https://daily-device.vercel.app/
- 관리자 페이지: https://daily-device.vercel.app/admin
- 데모 로그인: 로그인 페이지의 데모 로그인 버튼 사용

관리자 권한은 DB의 `User.role` 값으로 판단합니다.

- `USER`: 관리자 페이지 조회만 가능
- `ADMIN`: 추가, 수정, 삭제 가능

데모 계정은 관리자 페이지를 읽기 전용으로 조회할 수 있습니다.

## 사용 기술

### Frontend

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS v4
- TanStack Query v5

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

## 주요 화면

| 경로                          | 설명                                               |
| ----------------------------- | -------------------------------------------------- |
| `/`                           | 홈, Hero, 대표 상품, 카테고리 섹션                 |
| `/products`                   | 전체 상품 목록                                     |
| `/products/discounts`         | 할인 상품 목록                                     |
| `/products/[category]`        | 카테고리별 상품 목록                               |
| `/products/[category]/[slug]` | 상품 상세, 장바구니 및 바로구매, 상품평, 추천 상품 |
| `/search`                     | 상품 검색 결과                                     |
| `/checkout`                   | 주문 정보 확인과 테스트 결제                       |
| `/my`                         | 마이페이지 요약                                    |
| `/my/orders`                  | 주문 목록                                          |
| `/my/wishlist`                | 찜한 상품                                          |
| `/my/address`                 | 배송지 관리                                        |
| `/my/reviews/write`           | 작성 가능한 상품평                                 |
| `/my/reviews`                 | 작성한 상품평                                      |
| `/admin`                      | 관리자 페이지                                      |

## 프로젝트에서 신경 쓴 부분

- Next.js App Router는 라우팅 엔트리로만 두고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 분리했습니다.
- API Route에서는 요청 params, query, body를 Zod schema로 검증하고, 클라이언트 폼에서는 즉시 피드백을 위한 별도 검증 로직을 적용했습니다.
- TanStack Query의 prefetch/hydration과 query key 분리로 서버 초기 데이터와 클라이언트 캐시를 관리했습니다.
- 장바구니와 찜하기는 낙관적 업데이트를 적용해 사용자 조작에 즉시 반응하도록 했습니다.
- 상품 상세 페이지의 공통 상품 정보는 빌드 시점 또는 ISR 재검증 시점에 미리 렌더링해 빠르게 제공하고, 찜 여부·장바구니 개수처럼 사용자별로 달라지는 상태는 클라이언트 컴포넌트와 TanStack Query로 분리해 클라이언트에서 조회·갱신했습니다.
- 주문은 결제 대기, 결제 완료, 취소, 만료 흐름을 분리했고, 실제 배송 상태를 추적할 수 없는 포트폴리오 환경에서는 사용자의 수취확인으로 상품평 작성 가능 상태가 되도록 설계했습니다.
- 관리자 페이지는 일반 계정도 데이터를 볼 수 있지만, 수정은 `ADMIN` 역할을 가진 계정만 가능하게 하고 상품평 작성자 정보는 권한에 따라 마스킹했습니다.
- Cloudinary를 이미지 서버로 사용하고, 서버에서 업로드 경로와 서명을 생성해 상품, Hero, 상품평 이미지를 대상별 폴더와 public id 규칙에 맞춰 업로드합니다.
- base64 blurDataURL을 사용해 이미지 로딩 중 빈 화면 노출과 레이아웃 흔들림을 줄였습니다.
- DB에 저장된 이미지 URL을 기준으로 렌더링하고, 색상별 이미지가 없으면 기본 이미지로 fallback합니다.
- 로딩, 빈 상태, 에러 상태를 페이지 단위로 분리해 주요 사용자 흐름이 끊기지 않도록 했습니다.
- 기능이 아직 연결되지 않은 UI는 클릭 시 `현재 준비 중인 기능입니다.` 토스트를 표시해, 사용자가 비활성 상태인지 오류인지 혼동하지 않도록 처리했습니다.
- 배송지 입력은 Daum 우편번호 검색과 상세주소 입력을 분리해 주소 입력 오류를 줄였습니다.
- 상품평 작성은 구매한 주문 상품 기준으로만 가능하도록 서버에서 권한과 주문 상태를 확인했습니다.

## 회고

프로젝트를 진행하며 고민했던 구조와 데이터 패칭 기준은 [RETROSPECTIVE.md](./RETROSPECTIVE.md)에 정리했습니다.

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
prisma/               Prisma schema와 seed 스크립트
public/               로고, fallback, 홈/카테고리 등 정적 UI 이미지
```

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

```txt
http://localhost:3000
```

## DB 관리

포트폴리오 목적의 프로젝트라 migration 파일은 Git에 포함하지 않고, `schema.prisma`와 `db push`기준으로 관리했습니다.

```bash
npx prisma db push
npm run db:seed
```
