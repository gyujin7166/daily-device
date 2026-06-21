# Daily Device

Next.js App Router 기반 이커머스 포트폴리오 프로젝트입니다.

상품 탐색, 장바구니, 체크아웃, 주문 관리, 상품평, 찜하기, 관리자 페이지까지 이어지는 이커머스 흐름을 구현했습니다. 라우팅은 Next.js App Router의 `app/`에서 담당하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 `src/` 하위 레이어로 분리했습니다.

> 이 프로젝트는 포트폴리오 목적의 데모 서비스입니다. 실제 상품 판매, 배송, 결제 처리는 이루어지지 않으며, Toss Payments는 테스트 결제 환경을 사용합니다. 데모 사용 시 실제 개인정보를 입력하지 않는 것을 권장합니다.

## 배포

- 배포 사이트: https://daily-device.vercel.app
- 관리자 페이지: https://daily-device.vercel.app/admin
- GitHub: https://github.com/gyujin7166/daily-device
- 데모 로그인: 로그인 페이지의 데모 로그인 버튼 사용

관리자 권한은 DB의 `User.role` 값으로 판단합니다.

- `USER`: 관리자 페이지 조회만 가능
- `ADMIN`: 추가, 수정, 삭제 가능

포트폴리오 검토를 위해 데모 계정은 관리자 페이지를 읽기 전용으로 조회할 수 있습니다.

## 사용 기술

### Frontend

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS v4
- TanStack Query v5

### Backend / Database

- Next.js Route Handlers
- Prisma
- TiDB / MySQL

### Auth / Validation

- Auth.js (NextAuth v5)
- Zod

### Infra / External

- Vercel
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
- 상품평 작성, 수정, 공개/숨김 처리
- 상품평 평점 분포, 이미지 갤러리, 도움 여부 피드백
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

| 화면       | 경로                                                              | 설명                                              |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| 메인       | `/`                                                               | Hero, Featured, Categories, 홈 카드 섹션          |
| 상품 목록  | `/products`, `/products/discounts`, `/products/[category]`        | 카테고리, 필터, 정렬, 무한 스크롤                 |
| 상품 검색  | `/search`                                                         | 검색어 기반 상품 검색 결과                        |
| 상품 상세  | `/products/[category]/[slug]`                                     | 상품 정보, 색상별 이미지, 상품평, 추천 상품       |
| 체크아웃   | `/checkout`                                                       | 배송지 선택, 주문 생성, Toss Payments 테스트 결제 |
| 마이페이지 | `/my`, `/my/orders`, `/my/wishlist`, `/my/address`, `/my/reviews` | 주문 목록, 주문 상세, 배송지, 찜 목록             |
| 관리자     | `/admin`                                                          | Hero, 상품, 홈 섹션, 상품평 관리                  |

## 화면 예시

| 메인 PC 화면                                    | 메인 모바일 화면                                   |
| ----------------------------------------------- | -------------------------------------------------- |
| ![메인 PC 화면](./docs/images/home-desktop.png) | ![메인 모바일 화면](./docs/images/home-mobile.png) |

## 프로젝트에서 신경 쓴 부분

- Next.js App Router는 라우팅 엔트리로 사용하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 분리했습니다.
- API Route에서는 요청 `params`, `query`, `body`를 Zod schema로 검증하고, 클라이언트 폼에서는 즉시 피드백을 위한 별도 검증 로직을 적용했습니다.
- TanStack Query의 prefetch/hydration, query key 분리, 낙관적 업데이트로 서버 상태와 클라이언트 UI를 관리했습니다.
- Prisma ORM과 TiDB/MySQL을 사용해 상품, 카테고리, 색상 옵션, 이미지, 장바구니, 주문, 배송지, 상품평, 찜하기 데이터를 관계형 구조로 설계했습니다.
- 주문은 `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED` 상태를 기준으로 결제, 취소, 만료 흐름을 분리했습니다.
- 상품평 작성은 구매한 주문 상품 기준으로만 가능하도록 서버에서 권한과 주문 상태를 확인했습니다.
- 포트폴리오 검토를 위해 일반 계정도 관리자 페이지를 읽기 전용으로 조회할 수 있게 하고, 데이터 수정은 `ADMIN` 권한 계정에서만 가능하게 했습니다.
- Cloudinary를 이미지 서버로 사용하고, 상품, Hero, 상품평 이미지를 대상별 폴더와 public id 규칙에 맞춰 업로드합니다.
- 상품과 Hero 이미지는 AI로 생성했고, 상품 seed 이미지는 Python `rembg` 라이브러리로 배경을 제거해 알파 채널이 있는 WebP 이미지로 가공했습니다.
- seed image manifest를 기준으로 Cloudinary 업로드 결과와 DB seed 데이터를 연결했습니다.
- base64 blurDataURL과 색상별 이미지 fallback으로 이미지 로딩 중 빈 화면 노출과 레이아웃 흔들림을 줄였습니다.
- 로딩, 빈 상태, 에러 상태를 페이지와 섹션 단위로 분리해 주요 사용자 흐름이 끊기지 않도록 했습니다.

## 회고

프로젝트를 진행하며 고민했던 구조, 데이터 패칭, 렌더링 전략은 [RETROSPECTIVE.md](./RETROSPECTIVE.md)에 정리했습니다.

## 폴더 구조

```txt
app/                  Next.js App Router 라우팅 엔트리
src/app/              Provider 등 앱 조립 코드
src/pages/            FSD pages layer, 페이지 단위 화면 조합
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

포트폴리오 목적의 프로젝트라 현재는 `schema.prisma`와 `db push` 기준으로 관리했습니다.

```bash
npx prisma db push
npm run db:seed
```

상품 seed 이미지는 미리 가공된 WebP 파일을 사용합니다. 가공된 이미지를 Cloudinary에 업로드하고 DB에 반영할 때는 아래 흐름을 사용합니다.

```bash
npm run upload:seed-images
npm run db:seed
```

## 검증

로컬에서 아래 명령으로 타입 검사, 린트, 빌드를 확인할 수 있습니다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```
