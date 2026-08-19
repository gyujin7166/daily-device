# Daily Device

Next.js App Router 기반 이커머스 포트폴리오 프로젝트입니다.

[![Quality Check](https://github.com/gyujin7166/daily-device/actions/workflows/quality.yml/badge.svg)](https://github.com/gyujin7166/daily-device/actions/workflows/quality.yml)
[![End-to-End Tests](https://github.com/gyujin7166/daily-device/actions/workflows/e2e.yml/badge.svg)](https://github.com/gyujin7166/daily-device/actions/workflows/e2e.yml)
[![Chromatic](https://github.com/gyujin7166/daily-device/actions/workflows/chromatic.yml/badge.svg)](https://github.com/gyujin7166/daily-device/actions/workflows/chromatic.yml)

상품 탐색, 장바구니, 체크아웃, 주문 관리, 상품평, 찜하기, 관리자 페이지까지 이어지는 이커머스 흐름을 구현했습니다. 라우팅은 Next.js App Router의 `app/`에서 담당하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 `src/` 하위 레이어로 분리했습니다.

> 이 프로젝트는 포트폴리오 목적의 데모 서비스입니다. 실제 상품 판매, 배송, 결제 처리는 이루어지지 않으며, Toss Payments는 테스트 결제 환경을 사용합니다. 데모 사용 시 실제 개인정보를 입력하지 않는 것을 권장합니다.

## 배포

- 배포 사이트: https://daily-device.vercel.app
- 관리자 페이지: https://daily-device.vercel.app/admin
- Storybook: https://main--6a82c7831d958c38f95c9b50.chromatic.com/
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
- Zustand v5
- React Hook Form v7
- next-intl

### Backend / Database

- Next.js Route Handlers
- Prisma
- TiDB / MySQL

### Auth / Validation

- Auth.js (NextAuth v5)
- Zod

### Infra / External

- Vercel
- Storybook / Chromatic
- Cloudinary
- Toss Payments

## 구현한 기능

- 상품 목록, 카테고리, 상세 페이지
- 상품 필터, 정렬, 검색, 추천 검색어, 무한 스크롤
- 색상 선택과 색상별 이미지 표시
- 추천 상품과 `localStorage` 기반 최근 본 상품 캐러셀
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
- 배송지, 상품평, 관리자 콘텐츠 폼의 상태 관리와 Zod 기반 유효성 검사
- 로그인, 소셜 로그인, 데모 로그인
- 한국어·영어 UI와 상품 콘텐츠, locale 기반 라우팅
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

## 기술적 하이라이트

- App Router는 라우팅 엔트리로 사용하고, 화면 조합과 기능 로직은 FSD 의존 방향에 맞춰 분리했습니다.
- 공개 쇼핑 화면은 정적 생성·ISR로 최적화하고, 인증과 권한이 필요한 체크아웃·마이페이지·관리자 화면은 동적으로 처리했습니다.
- TanStack Query의 prefetch/hydration, query key 분리와 낙관적 업데이트로 서버 상태를 관리했습니다.
- Zustand는 장바구니, 체크아웃, 상품 필터와 공통 UI처럼 여러 컴포넌트가 공유하는 클라이언트 상태를 기능별 store로 분리해 관리하고, 비회원 장바구니는 `persist` middleware와 `localStorage`로 유지했습니다.
- React Hook Form과 Zod resolver를 결합해 폼 상태와 유효성 검사를 관리하고, 일반 HTML 입력은 `register` 기반 비제어 방식으로, 별점·스위치 같은 커스텀 입력은 `Controller`로 연결했습니다.
- 한국어·영어 UI 메시지와 DB 콘텐츠 번역을 분리하고 locale별 API·캐시·라우팅 기준을 일관되게 유지했습니다.
- API 입력값은 Zod로 검증하고, 상품평 작성 권한과 주문 상태 같은 도메인 규칙은 서버에서 최종 확인합니다.
- 주문 상태를 결제·배송·취소·만료 흐름으로 분리하고, 일반 계정의 관리자 조회와 `ADMIN` 쓰기 권한을 구분했습니다.
- Cloudinary 업로드 규칙, base64 blurDataURL과 색상별 이미지 fallback으로 이미지 로딩 경험을 개선했습니다.
- Storybook과 Chromatic으로 컴포넌트 상태·상호작용을 문서화하고 시각적 변경을 검토합니다.
- Vitest·RTL·MSW·Playwright와 GitHub Actions를 사용해 로직부터 핵심 구매 흐름까지 검증합니다.

## 회고

프로젝트를 진행하며 고민했던 구조, 데이터 패칭, 렌더링 전략은 [RETROSPECTIVE.md](./RETROSPECTIVE.md)에 정리했습니다.

## 폴더 구조

```txt
app/                  Next.js App Router 라우팅 엔트리
pages/                Pages Router가 아닌 안내용 폴더
src/app/              Provider 등 앱 조립 코드
src/pages/            FSD pages layer, 페이지 단위 화면 조합
src/widgets/          여러 페이지에서 재사용되는 큰 UI
src/features/         기능 단위 UI와 로직
src/entities/         도메인 단위 타입, API, UI
src/shared/           공용 UI, 유틸, 상수
src/app/api-routes/   API Route 실제 구현
src/i18n/             next-intl 요청별 메시지 설정
messages/             한국어·영어 UI 메시지 카탈로그
prisma/               Prisma schema와 seed, seed 이미지 업로드 스크립트
public/               로고, fallback, 홈/카테고리 등 정적 UI 이미지
.storybook/            Storybook 전역 provider, theme, locale, MSW 설정
.github/workflows/     Quality Check, Playwright E2E, Chromatic workflow
```

## 실행

Node.js 24.x가 필요합니다. 버전 기준은 `.nvmrc`와 `package.json`의 `engines`에 맞춥니다.

```bash
npm install
cp .env.example .env.local
```

`.env.local`의 placeholder를 실제 개발 환경 값으로 교체합니다. 새로 만들었거나 비어 있는 개발 DB를 사용한다면 스키마와 기본·번역 seed 데이터를 준비합니다. 아래 명령은 `DATABASE_URL`이 가리키는 DB를 직접 변경하므로 운영 DB에는 실행하지 않습니다.

```bash
npx prisma db push
npm run db:seed
npm run db:seed:i18n
```

이미 초기화된 개발 DB를 사용한다면 DB 준비 명령은 생략할 수 있습니다. `npm install`의 `postinstall`에서 Prisma Client를 생성합니다.

```bash
npm run dev
```

```txt
http://localhost:3000
```

## Storybook

컴포넌트의 주요 상태와 사용자 상호작용은 Storybook에서 독립적으로 확인할 수 있습니다. API 응답이 필요한 스토리는 MSW fixture를 사용하며 실제 OAuth, 결제, 외부 API 또는 운영 DB를 호출하지 않습니다.

```bash
npm run storybook
```

```txt
http://localhost:6006
```

정적 Storybook 빌드는 다음 명령으로 확인합니다.

```bash
npm run build-storybook
```

branch가 GitHub에 push되면 Chromatic workflow가 Storybook을 배포하고 시각적 변경과 `play` 상호작용을 검사합니다. Chromatic 프로젝트 토큰은 코드나 환경 변수 예제에 기록하지 않고 GitHub Actions Repository Secret `CHROMATIC_PROJECT_TOKEN`으로만 관리합니다.

## 환경 변수

`.env.example`을 `.env.local`로 복사한 뒤 로컬 환경에 맞는 값을 설정합니다. `.env.example`을 제외한 `.env*` 파일은 Git에서 제외되며, `.env.example`에는 실제 Secret을 기록하지 않습니다.

### 기본 실행

| 구분          | 환경 변수                                 | 설명                                                                  |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Database      | `DATABASE_URL`                            | Prisma가 사용하는 개발 DB 연결 URL                                    |
| 연결 방식     | `DATABASE_CONNECTION_MODE`                | `serverless`가 기본값이며 직접 MySQL 연결이 필요할 때만 `direct` 사용 |
| Auth.js       | `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL` | 세션 서명과 로컬 callback 기준 URL                                    |
| Auth 디버그   | `AUTH_DEBUG`                              | 인증 문제를 확인할 때만 `true`로 설정                                 |
| 데모 로그인   | `DEMO_USER_EMAIL`, `DEMO_USER_NAME`       | 생략하면 코드의 데모 계정 기본값 사용                                 |
| API 기준 경로 | `NEXT_PUBLIC_API_URL`                     | 생략하면 현재 origin의 상대 경로 사용                                 |

### 기능별 선택 설정

| 기능             | 환경 변수                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google OAuth     | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                                                                                                                   |
| Naver OAuth      | `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`                                                                                                                     |
| Kakao OAuth      | `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`                                                                                                                     |
| Cloudinary       | `CLOUDINARY_URL` 또는 `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, 업로드 preset과 folder prefix 변수 |
| Toss Payments    | `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`                                                                                                         |
| Seed 이미지 도구 | `SEED_IMAGE_ROOT`, `SEED_IMAGE_MANIFEST_PATH`, `SEED_MAIN_HERO_IMAGE_URL`, `SEED_PRODUCT_ALL_HERO_IMAGE_URL`, `SEED_PRODUCT_DISCOUNTS_HERO_IMAGE_URL`    |

`NEXT_PUBLIC_*` 변수는 브라우저 번들에 포함되므로 Secret을 넣으면 안 됩니다. OAuth client secret, `AUTH_SECRET`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`, `TOSS_SECRET_KEY`와 DB URL은 서버 환경에서만 관리합니다.

### E2E와 배포 환경

- 로컬 Playwright는 `PLAYWRIGHT_DATABASE_URL`을 우선 사용하고, 환경 변수 자체가 없으면 개발용 `DATABASE_URL`을 사용합니다.
- `.env.example`을 복사하면 `PLAYWRIGHT_DATABASE_URL` placeholder도 함께 생성됩니다. E2E 전용 DB를 사용한다면 실제 URL로 교체하고, 개발용 `DATABASE_URL` fallback을 사용한다면 해당 줄 전체를 삭제하거나 주석 처리합니다. 빈 문자열로 남겨도 fallback되지 않습니다.
- GitHub Actions에서는 Repository Secret `PLAYWRIGHT_DATABASE_URL`이 반드시 `daily_device_e2e` 전용 DB를 가리켜야 합니다.
- `PLAYWRIGHT_DATABASE_URL`은 Vercel에 등록하지 않습니다. Vercel Preview와 Production의 DB, OAuth, Cloudinary, 결제 환경 변수는 각 환경에서 별도로 관리합니다.
- `CI`, `VERCEL`, `E2E_BUILD`, `NEXT_DIST_DIR`은 플랫폼, workflow와 Playwright 설정이 내부적으로 제어하므로 일반적인 `.env.local` 설정에 추가하지 않습니다.

## DB 관리

포트폴리오 목적의 프로젝트라 현재는 `schema.prisma`와 `db push` 기준으로 관리했습니다.

```bash
npx prisma db push
npm run db:seed
npm run db:seed:i18n
```

`db:seed`는 기본 카탈로그 데이터를 준비하고, `db:seed:i18n`은 locale별 번역 데이터를 동기화합니다.

상품 seed 이미지는 미리 가공된 WebP 파일을 사용합니다. 가공된 이미지를 Cloudinary에 업로드하고 DB에 반영할 때는 아래 흐름을 사용합니다.

```bash
npm run upload:seed-images
npm run db:seed
```

## 국제화 (i18n)

`next-intl`을 사용해 한국어와 영어를 지원합니다. locale의 기준은 `src/shared/config/i18n/routing.ts`이며, 기본 locale은 한국어입니다. 한국어 경로는 `/products`처럼 접두사 없이 표시되고, 영어 경로는 `/en/products`처럼 `/en` 접두사를 사용합니다. 저장된 `NEXT_LOCALE` 쿠키가 없고 URL에도 locale이 없으면 브라우저의 최우선 선호 언어가 한국어가 아닐 때 영어 경로로 안내합니다.

- UI 문구: `messages/ko.json`, `messages/en.json`
- 상품, 카테고리, Hero 등 DB 콘텐츠: Prisma의 locale별 번역 모델
- locale 인식 링크·이동과 요청별 메시지 로딩: `src/shared/lib/i18n/navigation.ts`, `src/i18n/request.ts`

UI 메시지의 key와 ICU placeholder 일치 여부를 테스트하고, API·TanStack Query key·prefetch와 hydration 데이터에도 같은 locale을 사용합니다. 번역 seed 실행 방법은 위의 DB 관리 절차에 포함했습니다.

## 테스트

테스트 범위에 따라 다음 도구를 구분해 사용합니다.

- Vitest: 가격 계산, 장바구니 variant, checkout 조건과 같은 순수 로직 및 hook 테스트
- React Testing Library: 사용자에게 보이는 컴포넌트 상태와 상호작용 테스트
- MSW: 장바구니, 찜, 주문 API의 성공, 실패, 빈 응답에 따른 클라이언트 통합 테스트
- Storybook: 컴포넌트의 주요 variant, 빈 상태, 오류 상태와 사용자 상호작용 확인
- Chromatic: 배포된 Storybook의 시각적 변경과 `play` 상호작용 검사
- Playwright: 실제 Chromium에서 라우팅, 인증 상태, 저장소와 핵심 사용자 흐름을 검증하는 E2E 테스트

버그 수정이나 로직·사용자 상호작용 변경에는 가능한 한 실패하는 재현 테스트를 먼저 확인하고, 최소 구현과 리팩터링 후 다시 검증합니다.

| 명령어                    | 검증 범위                                   |
| ------------------------- | ------------------------------------------- |
| `npm run test:unit`       | Vitest 단위·컴포넌트·클라이언트 통합 테스트 |
| `npm run test:e2e`        | Playwright Chromium 핵심 사용자 흐름        |
| `npm run test:visual`     | `@visual` 태그 기반 시각 회귀 테스트        |
| `npm run test:all`        | Vitest 실행 후 Playwright E2E 실행          |
| `npm run storybook`       | 로컬 Storybook 개발 서버                    |
| `npm run build-storybook` | 정적 Storybook 빌드                         |

현재 E2E 테스트는 다음 흐름을 검증합니다.

- 홈 화면의 핵심 탐색 UI 표시
- 한국어·영어 locale 전환과 URL prefix 처리
- 홈·상품·검색에서 locale 전환 중 다크 테마 유지
- 두 locale의 404 응답, 홈 이동과 hydration 안정성
- 비회원이 상품을 장바구니에 담고 결제를 선택했을 때 로그인 화면으로 이동하는 인증 경계
- 로그인 사용자의 상품 추가, 배송지 선택, 체크아웃, 데모 결제, 주문 내역 확인

인증 E2E는 전용 사용자를 사용하고 테스트 전후의 장바구니·배송지·주문 데이터를 정리합니다. CI에서는 운영 DB와 분리된 `daily_device_e2e` DB만 허용하며, 로컬에서 같은 DB를 준비할 때는 다음 명령을 사용합니다.

```bash
npm run db:prepare:e2e
```

실제 OAuth, Toss Payments 승인과 운영 DB는 자동화 테스트에서 사용하지 않습니다.

## CI/CD

| 시점               | 검증 및 배포                                                          |
| ------------------ | --------------------------------------------------------------------- |
| Pull request       | format·unit·type·lint, production build, Chromium E2E, Vercel Preview |
| Branch push        | Chromatic Storybook 배포 및 UI 검사                                   |
| `main` 브랜치 반영 | 동일한 GitHub Actions 재검증 후 Vercel Production 배포                |

- E2E는 운영 DB와 분리된 전용 TiDB의 스키마와 seed 상태를 준비한 뒤 실행합니다.
- `E2E_BUILD=true`에서는 테스트에 필요한 대표 상품과 카테고리만 정적 생성하고, 로컬·Vercel build는 전체 경로를 생성합니다.
- GitHub Actions와 Vercel의 Preview·Production 환경 변수 및 Secret은 서로 분리합니다.

홈과 상품 목록·할인·카테고리·상세 경로는 정적 생성과 1시간 단위 ISR을 사용합니다. 관리자 페이지에서 Hero, 홈 섹션, 상품 또는 상품평을 변경하는 mutation은 공개 shop layout을 revalidate해 주기적인 갱신을 기다리지 않고 변경 사항을 반영합니다.

정적 생성 경로 최적화와 Playwright DB 연결 안정화 과정은 [회고](./RETROSPECTIVE.md#github-actions-정적-생성-병목-개선)에 정리했습니다.

## 검증

로컬에서 전체 테스트와 타입 검사, 린트, 빌드를 확인할 수 있습니다.

```bash
npm run test:all
npx tsc --noEmit
npm run lint
npm run build
```
