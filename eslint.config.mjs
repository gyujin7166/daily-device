import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import importPlugin from 'eslint-plugin-import';

const importOrderRule = [
  'warn',
  {
    groups: [
      'builtin',
      'external',
      'internal',
      'parent',
      'sibling',
      'index',
      'object',
      'type',
    ],
    pathGroups: [
      { pattern: 'react', group: 'external', position: 'before' },
      { pattern: 'next', group: 'external', position: 'before' },
      { pattern: 'next/**', group: 'external', position: 'before' },
      { pattern: 'constants/**', group: 'internal', position: 'before' },
      { pattern: 'hooks/**', group: 'internal', position: 'before' },
      { pattern: 'lib/**', group: 'internal', position: 'before' },
      { pattern: 'utils/**', group: 'internal', position: 'before' },
      { pattern: 'services/**', group: 'internal', position: 'before' },
      { pattern: 'types/**', group: 'internal', position: 'before' },
      { pattern: '@app/**', group: 'internal', position: 'before' },
      { pattern: '@pages/**', group: 'internal', position: 'before' },
      { pattern: 'features/**', group: 'internal', position: 'before' },
      { pattern: '@features/**', group: 'internal', position: 'before' },
      { pattern: '@entities/**', group: 'internal', position: 'before' },
      { pattern: '@widgets/**', group: 'internal', position: 'before' },
      { pattern: '@shared/**', group: 'internal', position: 'before' },
    ],
    pathGroupsExcludedImportTypes: ['react', 'next'],
    'newlines-between': 'always',
    alphabetize: {
      order: 'asc',
      caseInsensitive: true,
    },
  },
];

const toRestrictedPaths = (entries, message) =>
  entries.map((name) => ({
    name,
    message,
  }));

const toRestrictedPatterns = (entries, message) =>
  entries.map((name) => ({
    group: [`${name}/**`],
    message,
  }));

const toSameLayerSliceConfigs = ({
  layer,
  entries,
  restrictedUpperPatterns,
  sameLayerMessage,
  upperLayerMessage,
}) =>
  entries.map((entry) => {
    const sliceName = entry.replace(`@${layer}/`, '');
    const otherEntries = entries.filter((target) => target !== entry);
    return {
      files: [`src/${layer}/${sliceName}/**/*.{js,jsx,ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: toRestrictedPaths(otherEntries, sameLayerMessage),
            patterns: [
              ...toRestrictedPatterns(otherEntries, sameLayerMessage),
              {
                group: restrictedUpperPatterns,
                message: upperLayerMessage,
              },
            ],
          },
        ],
      },
    };
  });

const featureSliceEntries = [
  '@features/admin-hero',
  '@features/admin-home',
  '@features/admin-product',
  '@features/admin-review',
  '@features/auth',
  '@features/cart',
  '@features/checkout',
  '@features/home',
  '@features/my',
  '@features/product',
  '@features/product-detail',
  '@features/product-filter',
  '@features/product-review',
  '@features/search',
];

const entitySliceEntries = [
  '@entities/address',
  '@entities/cart',
  '@entities/order',
  '@entities/product',
  '@entities/review',
  '@entities/wishlist',
];

const widgetSliceEntries = ['@widgets/my-orders', '@widgets/navigation'];

const pageSliceEntries = [
  '@pages/checkout',
  '@pages/home',
  '@pages/login',
  '@pages/my',
  '@pages/payments',
  '@pages/products',
  '@pages/search',
  '@pages/shop',
];

const sharedSegmentEntries = ['@shared/config', '@shared/lib', '@shared/types'];
const appSegmentEntries = ['@app/providers'];

export default defineConfig([
  ...(Array.isArray(nextVitals) ? nextVitals : [nextVitals]),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': importOrderRule,
      'import/newline-after-import': ['warn', { count: 1 }],
      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  ...toSameLayerSliceConfigs({
    layer: 'features',
    entries: featureSliceEntries,
    restrictedUpperPatterns: ['@widgets/**', '@pages/**', '@app/**'],
    sameLayerMessage:
      'features 레이어에서는 다른 feature slice를 직접 임포트하지 마세요. 공통 도메인 로직은 entities/shared로 내리거나 widgets/pages에서 조립하세요.',
    upperLayerMessage:
      'features 레이어에서는 상위 레이어(@widgets/@pages/@app)를 임포트하지 마세요.',
  }),
  {
    files: ['src/entities/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: toRestrictedPaths(
            entitySliceEntries,
            'entities 내부 파일에서는 @entities/<slice> 진입점을 재임포트하지 말고 상대경로를 사용하세요.',
          ),
          patterns: [
            {
              group: ['@features/**', '@widgets/**', '@pages/**', '@app/**'],
              message:
                'entities 레이어에서는 상위 레이어(@features/@widgets/@pages/@app)를 임포트하지 마세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/widgets/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: toRestrictedPaths(
            widgetSliceEntries,
            'widgets 내부 파일에서는 @widgets/<slice> 진입점을 재임포트하지 말고 상대경로를 사용하세요.',
          ),
          patterns: [
            {
              group: ['@pages/**', '@app/**'],
              message:
                'widgets 레이어에서는 상위 레이어(@pages/@app)를 임포트하지 마세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: toRestrictedPaths(
            sharedSegmentEntries,
            'shared 내부 파일에서는 @shared/<segment> 진입점을 재임포트하지 말고 상대경로를 사용하세요.',
          ),
          patterns: [
            {
              group: [
                '@entities/**',
                '@features/**',
                '@widgets/**',
                '@pages/**',
                '@app/**',
              ],
              message:
                'shared 레이어에서는 상위 레이어(@entities/@features/@widgets/@pages/@app)를 임포트하지 마세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: toRestrictedPaths(
            pageSliceEntries,
            'pages 내부 파일에서는 @pages/<slice> 진입점을 재임포트하지 말고 상대경로를 사용하세요.',
          ),
          patterns: [
            {
              regex: '^@app/(?!api-routes/.*/service$).+',
              message:
                'pages 레이어에서는 @app 레이어를 직접 임포트하지 마세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: toRestrictedPaths(
            appSegmentEntries,
            'src/app 내부 파일에서는 @app/* 진입점을 재임포트하지 말고 상대경로를 사용하세요.',
          ),
        },
      ],
    },
  },
  {
    files: ['app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@widgets/**',
                '@features/**',
                '@entities/**',
                '@shared/**',
              ],
              message:
                'app 엔트리에서는 하위 레이어를 직접 임포트하지 말고 @pages 또는 @app 세그먼트를 통해 조립하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['app/api/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.next-playwright/**',
    'node_modules/**',
    'playwright-report/**',
    'public/mockServiceWorker.js',
    'storybook-static/**',
    'test-results/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
