# Daily Device

Next.js App Router 기반 이커머스 포트폴리오 프로젝트입니다.

상품 탐색, 장바구니, 체크아웃, 주문 관리, 상품평, 찜하기, 관리자 페이지까지 이어지는 이커머스 흐름을 구현했습니다. 라우팅은 Next.js App Router의 `app/`에서 담당하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 `src/` 하위 레이어로 분리했습니다.

> 이 프로젝트는 포트폴리오 목적의 데모 서비스입니다. 실제 상품 판매, 배송, 결제 처리는 이루어지지 않으며, Toss Payments는 테스트 결제 환경을 사용합니다. 데모 사용 시 실제 개인정보를 입력하지 않는 것을 권장합니다.

## 배포

- 배포 사이트: https://daily-device.vercel.app
- 관리자 페이지: https://daily-device.vercel.app/admin
- 데모 로그인: 로그인 페이지의 데모 로그인 버튼 사용

관리자 권한은 DB의 `User.role` 값으로 판단합니다.

- `USER`: 관리자 페이지 조회만 가능
- `ADMIN`: 추가, 수정, 삭제 가능

포트폴리오 검토를 위해 데모 계정은 관리자 페이지를 읽기 전용으로 조회할 수 있습니다.

배포와 검증은 다음 흐름으로 진행합니다.

- Pull request: Quality Check, Playwright E2E, Vercel Preview 확인
- `main` 병합: 동일한 GitHub Actions 재검증 후 Vercel Production 배포
- GitHub Actions의 E2E 환경과 Vercel의 Preview·Production 환경 변수는 서로 분리

## 사용 기술

### Frontend

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS v4
- TanStack Query v5
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
- 배송지/상품평 입력 폼 유효성 검사
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

## 프로젝트에서 신경 쓴 부분

- Next.js App Router는 라우팅 엔트리로 사용하고, 화면 조합과 기능 로직은 FSD 구조에 맞춰 분리했습니다.
- UI 문구는 `messages/ko.json`, `messages/en.json` 카탈로그로 관리하고, 상품·카테고리처럼 DB에서 조회하는 콘텐츠는 locale별 번역 테이블과 한국어 fallback을 사용합니다.
- API Route에서는 요청 `params`, `query`, `body`를 Zod schema로 검증하고, 클라이언트 폼에서는 즉시 피드백을 위한 별도 검증 로직을 적용했습니다.
- TanStack Query의 prefetch/hydration, query key 분리, 낙관적 업데이트로 서버 상태와 클라이언트 UI를 관리했습니다.
- Prisma ORM과 TiDB/MySQL을 사용해 상품, 카테고리, 색상 옵션, 이미지, 장바구니, 주문, 배송지, 상품평, 찜하기 데이터를 관계형 구조로 설계했습니다.
- 주문은 `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `EXPIRED` 상태를 기준으로 결제, 배송, 취소, 만료 흐름을 분리했습니다.
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
src/i18n/             next-intl 요청별 메시지 설정
messages/             한국어·영어 UI 메시지 카탈로그
prisma/               Prisma schema와 seed, seed 이미지 업로드 스크립트
public/               로고, fallback, 홈/카테고리 등 정적 UI 이미지
.github/workflows/     Quality Check와 Playwright E2E workflow
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

번역 데이터는 성격에 따라 나누어 관리합니다.

- UI 문구: `messages/ko.json`, `messages/en.json`
- 상품, 카테고리, Hero 등 DB 콘텐츠: Prisma의 locale별 번역 모델
- locale 인식 링크와 이동: `src/shared/lib/i18n/navigation.ts`
- 요청별 메시지 로딩: `src/i18n/request.ts`

UI 문구를 추가할 때는 두 메시지 카탈로그에 같은 key와 ICU placeholder를 추가합니다. locale을 사용하는 API, TanStack Query key, prefetch와 hydration 데이터도 같은 locale로 분리합니다. DB 콘텐츠 번역을 변경할 때는 대상 DB를 확인한 뒤 i18n seed를 실행합니다.

```bash
npx vitest run src/i18n/messages.test.ts
npm run db:seed:i18n
```

`db:seed:i18n`은 `DATABASE_URL`이 가리키는 DB를 직접 변경하므로 실행 전에 대상이 의도한 개발 DB인지 확인해야 합니다. E2E DB의 스키마와 번역 데이터를 준비할 때는 아래의 `db:prepare:e2e`를 사용합니다. 이 명령이 `PLAYWRIGHT_DATABASE_URL`을 검증한 뒤 seed 과정에 `DATABASE_URL`로 전달합니다.

## 테스트

테스트 범위에 따라 다음 도구를 구분해 사용합니다.

- Vitest: 가격 계산, 장바구니 variant, checkout 조건과 같은 순수 로직 및 hook 테스트
- React Testing Library: 사용자에게 보이는 컴포넌트 상태와 상호작용 테스트
- MSW: 장바구니, 찜, 주문 API의 성공, 실패, 빈 응답에 따른 클라이언트 통합 테스트
- Playwright: 실제 Chromium에서 라우팅, 인증 상태, 저장소와 핵심 사용자 흐름을 검증하는 E2E 테스트

### 테스트 개발 방식

프로젝트 전체를 처음부터 TDD로 개발하지는 않았습니다. 현재는 버그 수정이나 로직·사용자 상호작용 변경 시 가능한 한 실패하는 재현 테스트를 먼저 확인하고, 최소 구현으로 통과시킨 뒤 리팩터링과 재검증을 진행합니다. 문구, 스타일과 단순 정적 마크업 변경에는 테스트 우선을 적용하지 않습니다.

주요 테스트 명령은 다음과 같습니다.

| 명령어                | 설명                                          |
| --------------------- | --------------------------------------------- |
| `npm test`            | Vitest watch 모드                             |
| `npm run test:unit`   | 단위·컴포넌트·클라이언트 통합 테스트 1회 실행 |
| `npm run test:e2e`    | Playwright Chromium E2E 실행                  |
| `npm run test:e2e:ui` | Playwright UI 모드 실행                       |
| `npm run test:all`    | Vitest 실행 후 Playwright E2E 실행            |
| `npm run test:visual` | `@visual` 태그가 있는 시각 회귀 테스트 실행   |

현재 등록된 `@visual` 테스트가 없으면 `test:visual`은 성공으로 종료됩니다.

Playwright 브라우저가 설치되지 않았다면 최초 한 번 Chromium을 설치합니다.

```bash
npx playwright install chromium
```

현재 E2E 테스트는 다음 흐름을 검증합니다.

- 홈 화면의 핵심 탐색 UI 표시
- 한국어·영어 locale 전환과 URL prefix 처리
- 홈·상품·검색에서 locale 전환 중 다크 테마 유지
- 두 locale의 404 응답, 홈 이동과 hydration 안정성
- 비회원이 상품을 장바구니에 담고 결제를 선택했을 때 로그인 화면으로 이동하는 인증 경계
- 로그인 사용자의 상품 추가, 배송지 선택, 체크아웃, 데모 결제, 주문 내역 확인

인증 E2E는 `playwright@daily-device.local` 전용 사용자를 사용하며 테스트 전후에 장바구니, 배송지와 주문 데이터를 정리합니다. 로컬에서는 `PLAYWRIGHT_DATABASE_URL`이 있으면 해당 DB를 사용하고, 환경 변수 자체가 설정되지 않았으면 `DATABASE_URL`을 사용합니다. 이 fallback DB도 운영 DB가 아닌 개발용 DB여야 합니다. CI에서는 실수로 운영 DB를 사용하지 않도록 `PLAYWRIGHT_DATABASE_URL`이 반드시 필요합니다.

```env
PLAYWRIGHT_DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/daily_device_e2e?sslaccept=strict"
```

E2E 전용 DB의 스키마와 seed 데이터를 수동으로 준비할 때는 다음 명령을 실행합니다. 이 명령은 URL의 데이터베이스 이름이 정확히 `daily_device_e2e`인 경우에만 실행되며, 검증된 URL을 Prisma의 `DATABASE_URL`로 전달합니다. 스키마를 동기화한 뒤 필수 seed 상태를 확인하고, 데이터가 비어 있거나 불완전한 경우에만 기본 seed와 i18n seed를 동기화합니다.

```bash
npm run db:prepare:e2e
```

실제 OAuth, Toss Payments 승인과 운영 DB는 자동화 테스트에서 사용하지 않습니다. 결제 E2E는 외부 결제창을 호출하지 않는 데모 결제 흐름만 검증합니다.

## CI/CD

### Quality Check

GitHub Actions의 `Quality Check` workflow는 pull request와 `main` 브랜치 push에서 다음 검사를 실행합니다.

```bash
npm run format:check
npm run test:unit
npx tsc --noEmit
npm run lint
```

### Playwright E2E

`End-to-End Tests` workflow는 같은 저장소에서 생성된 pull request와 `main` 브랜치 push에서 production build와 Chromium E2E를 실행합니다. E2E 전용 TiDB URL은 Repository Secret인 `PLAYWRIGHT_DATABASE_URL`로 전달하며, 빌드와 Playwright 실행 전에 전용 DB의 Prisma 스키마와 필수 seed 상태를 자동으로 준비합니다. 이미 seed가 준비되어 있으면 긴 동기화 작업은 건너뜁니다. URL의 데이터베이스 이름이 `daily_device_e2e`가 아니면 준비 단계에서 중단합니다.

CI의 DB 준비와 Playwright 실행에서는 전용 URL 구성 로직이 기존 SSL 옵션을 보존하고 `connection_limit=3`, `connect_timeout=30`, `pool_timeout=60`을 적용합니다. 같은 연결 옵션이 이미 있으면 CI 설정으로 교체합니다. Production build도 해당 Secret을 `DATABASE_URL`로 전달하고 같은 연결 옵션을 적용합니다. `E2E_BUILD=true`인 GitHub Actions에서는 E2E DB에서 노출 상태, 대표 이미지, 기본 색상과 한국어·영어 번역이 준비된 첫 번째 상품을 조회하고 해당 상품과 카테고리만 대표 정적 경로로 생성합니다. 전체 상품·카테고리 경로 조회는 생략하며, Playwright도 같은 기준으로 선택한 상품과 카테고리를 사용합니다. 로컬 및 Vercel의 일반 production build는 기존처럼 전체 정적 경로를 생성합니다.

E2E production build에만 정적 생성 워커 2개를 사용하고, 워커당 동시에 처리하는 페이지는 1개로 제한하며, 개별 페이지 생성은 최대 2회 재시도합니다. `P1001` 또는 DB 서버 연결 실패로 전체 빌드가 중단되면 10초 후 한 번 더 실행합니다. job의 최대 실행 시간은 60분입니다.

GitHub-hosted runner에서는 `DATABASE_CONNECTION_MODE=direct`를 설정해 Prisma의 직접 MySQL 연결을 사용합니다. 애플리케이션의 기본 연결은 기존 TiDB Cloud Serverless adapter를 유지합니다. 인증 E2E의 데모 로그인 요청이 일시적인 5xx 응답을 반환하면 1초 간격으로 최대 3회 시도하며, 4xx 응답이나 반복되는 서버 오류는 테스트 실패로 처리합니다.

같은 ref에서 새 workflow가 시작되면 이전 실행은 취소됩니다. CI의 Playwright 테스트는 실패 시 최대 2회 재시도하며, 재시도로 통과한 경우에도 첫 실패 원인을 확인합니다. 실패한 실행의 trace와 스크린샷은 7일 동안 `playwright-test-results` artifact에서 확인할 수 있습니다.

GitHub Actions Secret이 제공되지 않는 fork 또는 Dependabot pull request에서는 production build와 E2E를 포함한 해당 job을 건너뜁니다.

### Vercel 배포

Pull request에는 Vercel Preview 배포를 연결하고, 필수 GitHub Actions 검사를 통과해 `main`에 병합된 커밋은 Production으로 배포합니다. GitHub Actions의 `PLAYWRIGHT_DATABASE_URL`은 Vercel에 전달하지 않으며, Vercel의 Preview와 Production에는 각 환경에 맞는 `DATABASE_URL`, OAuth, Cloudinary, 결제 관련 환경 변수를 별도로 설정합니다.

홈과 상품 목록·할인·카테고리·상세 경로는 정적 생성과 1시간 단위 ISR을 사용합니다. 관리자 페이지에서 Hero, 홈 섹션, 상품 또는 상품평을 변경하는 mutation은 공개 shop layout을 revalidate해 주기적인 갱신을 기다리지 않고 변경 사항을 반영합니다.

## 검증

로컬에서 전체 테스트와 타입 검사, 린트, 빌드를 확인할 수 있습니다.

```bash
npm run test:all
npx tsc --noEmit
npm run lint
npm run build
```
