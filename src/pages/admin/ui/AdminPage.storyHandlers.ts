import { HttpResponse, delay, http } from 'msw';

import type { AdminHomePayload } from '@features/admin-home/model/types';
import type { AdminProductPayload } from '@features/admin-product/model/types';
import type { AdminReviewPayload } from '@features/admin-review/model/types';

import { ADMIN_ERROR_CODE } from '@shared/constants/adminErrorCode';
import { API_ERROR_CODE } from '@shared/constants/apiErrorCode';

import {
  createdHomeCard,
  createdProduct,
  createdProductHero,
  heroPayload,
  hiddenReview,
  homePayload,
  productPayload,
  reviewPayload,
  updatedHero,
  updatedHomeCard,
  updatedHomeSection,
  updatedProduct,
} from './AdminPage.storyData';

export const heroHandler = http.get('*/api/admin/heroes', () =>
  HttpResponse.json({ items: heroPayload }),
);

export const homeHandler = http.get('*/api/admin/home-sections', () =>
  HttpResponse.json({ items: homePayload }),
);

export const productsHandler = http.get('*/api/admin/products', () =>
  HttpResponse.json({ items: productPayload }),
);

export const reviewsHandler = http.get('*/api/admin/reviews', () =>
  HttpResponse.json({ items: reviewPayload }),
);

export const defaultHandlers = [
  heroHandler,
  homeHandler,
  productsHandler,
  reviewsHandler,
];

export const loadingHandlers = [
  http.get('*/api/admin/heroes', async () => {
    await delay('infinite');

    return HttpResponse.json({ items: heroPayload });
  }),
  homeHandler,
  productsHandler,
  reviewsHandler,
];

export const updateHeroHandlers = [
  ...defaultHandlers,
  http.put('*/api/admin/heroes/101', () =>
    HttpResponse.json({ items: updatedHero }),
  ),
];

export const createProductHeroHandlers = [
  ...defaultHandlers,
  http.post('*/api/admin/heroes', () =>
    HttpResponse.json({ items: createdProductHero }, { status: 201 }),
  ),
];

export const heroSaveErrorHandlers = [
  ...defaultHandlers,
  http.put('*/api/admin/heroes/101', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.HERO_UPDATE_FAILED,
        message: 'Failed to update the Hero.',
      },
      { status: 500 },
    ),
  ),
];

export function createHeroDeleteHandlers() {
  let isDeleted = false;

  return {
    reset: () => {
      isDeleted = false;
    },
    handlers: [
      http.get('*/api/admin/heroes', () =>
        HttpResponse.json({
          items: {
            ...heroPayload,
            heroes: isDeleted
              ? heroPayload.heroes.filter((hero) => hero.id !== 101)
              : heroPayload.heroes,
          },
        }),
      ),
      homeHandler,
      productsHandler,
      reviewsHandler,
      http.delete('*/api/admin/heroes/101', () => {
        isDeleted = true;

        return HttpResponse.json({ items: { id: 101 } });
      }),
    ],
  };
}

export const heroDeleteErrorHandlers = [
  ...defaultHandlers,
  http.delete('*/api/admin/heroes/101', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.HERO_DELETE_FAILED,
        message: 'Failed to delete the Hero.',
      },
      { status: 500 },
    ),
  ),
];

export function createUpdateHomeSectionHandlers() {
  let isUpdated = false;

  return {
    reset: () => {
      isUpdated = false;
    },
    handlers: [
      heroHandler,
      http.get('*/api/admin/home-sections', () =>
        HttpResponse.json({
          items: {
            ...homePayload,
            sections: isUpdated ? [updatedHomeSection] : homePayload.sections,
          },
        }),
      ),
      productsHandler,
      reviewsHandler,
      http.put('*/api/admin/home-sections/301', () => {
        isUpdated = true;

        return HttpResponse.json({ items: updatedHomeSection });
      }),
    ],
  };
}

export const homeSectionSaveErrorHandlers = [
  ...defaultHandlers,
  http.put('*/api/admin/home-sections/301', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.HOME_SECTION_UPDATE_FAILED,
        message: 'Failed to update the home section.',
      },
      { status: 500 },
    ),
  ),
];

function getHomeCardPayload(state: 'default' | 'updated' | 'created') {
  const items =
    state === 'updated'
      ? [updatedHomeCard]
      : state === 'created'
        ? [...homePayload.sections[0].items, createdHomeCard]
        : homePayload.sections[0].items;

  return {
    ...homePayload,
    sections: [{ ...homePayload.sections[0], items }],
  } satisfies AdminHomePayload;
}

function createHomeCardHandlers(action: 'update' | 'create') {
  let state: 'default' | 'updated' | 'created' = 'default';

  const mutationHandler =
    action === 'update'
      ? http.put('*/api/admin/home-section-items/401', () => {
          state = 'updated';

          return HttpResponse.json({ items: updatedHomeCard });
        })
      : http.post('*/api/admin/home-section-items', () => {
          state = 'created';

          return HttpResponse.json({ items: createdHomeCard }, { status: 201 });
        });

  return {
    reset: () => {
      state = 'default';
    },
    handlers: [
      heroHandler,
      http.get('*/api/admin/home-sections', () =>
        HttpResponse.json({ items: getHomeCardPayload(state) }),
      ),
      productsHandler,
      reviewsHandler,
      mutationHandler,
    ],
  };
}

export function createUpdateHomeCardHandlers() {
  return createHomeCardHandlers('update');
}

export function createCreateHomeCardHandlers() {
  return createHomeCardHandlers('create');
}

export const homeCardSaveErrorHandlers = [
  ...defaultHandlers,
  http.put('*/api/admin/home-section-items/401', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.HOME_CARD_UPDATE_FAILED,
        message: 'Failed to update the home card.',
      },
      { status: 500 },
    ),
  ),
];

function getProductPayload(
  state: 'default' | 'updated' | 'created' | 'deleted',
) {
  const items =
    state === 'updated'
      ? [updatedProduct]
      : state === 'created'
        ? [createdProduct, ...productPayload.products.items]
        : state === 'deleted'
          ? []
          : productPayload.products.items;

  return {
    ...productPayload,
    products: {
      ...productPayload.products,
      items,
      total:
        state === 'created'
          ? 2
          : state === 'deleted'
            ? 0
            : productPayload.products.total,
    },
  } satisfies AdminProductPayload;
}

function createProductMutationHandlers(action: 'update' | 'create' | 'delete') {
  let state: 'default' | 'updated' | 'created' | 'deleted' = 'default';

  const mutationHandler =
    action === 'update'
      ? http.put('*/api/admin/products/201', () => {
          state = 'updated';

          return HttpResponse.json({ items: updatedProduct });
        })
      : action === 'create'
        ? http.post('*/api/admin/products', () => {
            state = 'created';

            return HttpResponse.json(
              { items: createdProduct },
              { status: 201 },
            );
          })
        : http.delete('*/api/admin/products/201', () => {
            state = 'deleted';

            return HttpResponse.json({ items: { id: 201 } });
          });

  return {
    reset: () => {
      state = 'default';
    },
    handlers: [
      heroHandler,
      homeHandler,
      http.get('*/api/admin/products', () =>
        HttpResponse.json({ items: getProductPayload(state) }),
      ),
      reviewsHandler,
      mutationHandler,
    ],
  };
}

export function createUpdateProductHandlers() {
  return createProductMutationHandlers('update');
}

export function createCreateProductHandlers() {
  return createProductMutationHandlers('create');
}

export function createDeleteProductHandlers() {
  return createProductMutationHandlers('delete');
}

export const productSaveErrorHandlers = [
  ...defaultHandlers,
  http.put('*/api/admin/products/201', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.PRODUCT_UPDATE_FAILED,
        message: 'Failed to update the product.',
      },
      { status: 500 },
    ),
  ),
];

export const productDeleteErrorHandlers = [
  ...defaultHandlers,
  http.delete('*/api/admin/products/201', () =>
    HttpResponse.json(
      {
        code: ADMIN_ERROR_CODE.PRODUCT_DELETE_FAILED,
        message: 'Failed to delete the product.',
      },
      { status: 500 },
    ),
  ),
];

function getReviewPayload(state: 'visible' | 'hidden') {
  const isHidden = state === 'hidden';

  return {
    reviews: {
      ...reviewPayload.reviews,
      items: [isHidden ? hiddenReview : reviewPayload.reviews.items[0]],
    },
    summary: {
      total: 1,
      visible: isHidden ? 0 : 1,
      hidden: isHidden ? 1 : 0,
    },
  } satisfies AdminReviewPayload;
}

function createReviewStatusHandlers(initialState: 'visible' | 'hidden') {
  let state = initialState;

  return {
    reset: () => {
      state = initialState;
    },
    handlers: [
      heroHandler,
      homeHandler,
      productsHandler,
      http.get('*/api/admin/reviews', () =>
        HttpResponse.json({ items: getReviewPayload(state) }),
      ),
      http.patch('*/api/admin/reviews/801', () => {
        state = initialState === 'visible' ? 'hidden' : 'visible';

        return HttpResponse.json({
          items:
            state === 'hidden' ? hiddenReview : reviewPayload.reviews.items[0],
        });
      }),
    ],
  };
}

export function createHideReviewHandlers() {
  return createReviewStatusHandlers('visible');
}

export function createShowReviewHandlers() {
  return createReviewStatusHandlers('hidden');
}

export const reviewStatusErrorHandlers = [
  ...defaultHandlers,
  http.patch('*/api/admin/reviews/801', () =>
    HttpResponse.json({ code: API_ERROR_CODE.REQUEST_FAILED }, { status: 500 }),
  ),
];
