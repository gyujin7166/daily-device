import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import AdminPage from './AdminPage';
import {
  createdHomeCard,
  createdProduct,
  updatedHero,
  updatedHomeCard,
  updatedHomeSection,
  updatedProduct,
} from './AdminPage.storyData';
import {
  createCreateHomeCardHandlers,
  createCreateProductHandlers,
  createDeleteProductHandlers,
  createHeroDeleteHandlers,
  createHideReviewHandlers,
  createProductHeroHandlers,
  createShowReviewHandlers,
  createUpdateHomeCardHandlers,
  createUpdateHomeSectionHandlers,
  createUpdateProductHandlers,
  defaultHandlers,
  heroDeleteErrorHandlers,
  heroSaveErrorHandlers,
  homeCardSaveErrorHandlers,
  homeSectionSaveErrorHandlers,
  loadingHandlers,
  productDeleteErrorHandlers,
  productSaveErrorHandlers,
  reviewStatusErrorHandlers,
  updateHeroHandlers,
} from './AdminPage.storyHandlers';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const heroDeleteScenario = createHeroDeleteHandlers();
const updateHomeSectionScenario = createUpdateHomeSectionHandlers();
const updateHomeCardScenario = createUpdateHomeCardHandlers();
const createHomeCardScenario = createCreateHomeCardHandlers();
const updateProductScenario = createUpdateProductHandlers();
const createProductScenario = createCreateProductHandlers();
const deleteProductScenario = createDeleteProductHandlers();
const hideReviewScenario = createHideReviewHandlers();
const showReviewScenario = createShowReviewHandlers();

const meta = {
  title: 'Pages/Admin/AdminPage',
  component: AdminPage,
  tags: ['autodocs'],
  args: {
    canWriteAdmin: true,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/admin' },
    },
    msw: {
      handlers: defaultHandlers,
    },
  },
} satisfies Meta<typeof AdminPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: { msw: { handlers: loadingHandlers } },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    canWriteAdmin: false,
  },
};

export const UpdateHero: Story = {
  name: 'Update Hero',
  parameters: { msw: { handlers: updateHeroHandlers } },
  play: async ({ canvas }) => {
    const nameInput = await canvas.findByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, updatedHero.name_ko);
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(/ID 101.*스토리북에서 수정한 Hero/),
    ).toBeVisible();
  },
};

export const CreateProductHero: Story = {
  name: 'Create Product Hero',
  parameters: { msw: { handlers: createProductHeroHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^신규$|^New$/ }),
    );
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /^타입|^Type/ }),
      '2',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(await canvas.findByText(/ID 103.*키보드/)).toBeVisible();
  },
};

export const HeroSaveError: Story = {
  name: 'Hero Save Error',
  parameters: { msw: { handlers: heroSaveErrorHandlers } },
  play: async ({ canvas }) => {
    const nameInput = await canvas.findByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '저장 실패 재현');
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^Hero를 수정할 수 없습니다\.$|^Could not update the Hero\.$/,
      ),
    ).toBeVisible();
  },
};

export const DeleteHero: Story = {
  name: 'Delete Hero',
  beforeEach: () => {
    heroDeleteScenario.reset();
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: { msw: { handlers: heroDeleteScenario.handlers } },
  play: async ({ canvas }) => {
    const deleteButtons = await canvas.findAllByRole('button', {
      name: /^삭제$|^Delete$/,
    });

    await userEvent.click(deleteButtons[0]);

    await expect(
      await canvas.findByText(/ID 101.*매일의 작업 환경을 완성하세요/),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.queryByRole('cell', { name: '101' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const HeroDeleteError: Story = {
  name: 'Hero Delete Error',
  beforeEach: () => {
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: { msw: { handlers: heroDeleteErrorHandlers } },
  play: async ({ canvas }) => {
    const deleteButtons = await canvas.findAllByRole('button', {
      name: /^삭제$|^Delete$/,
    });

    await userEvent.click(deleteButtons[0]);

    await expect(
      await canvas.findByText(
        /^Hero를 삭제할 수 없습니다\.$|^Could not delete the Hero\.$/,
      ),
    ).toBeVisible();
    await expect(canvas.getByRole('cell', { name: '101' })).toBeVisible();
  },
};

export const OpenHomeTab: Story = {
  name: 'Open Home Tab',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^홈$|^Home$/ }));

    await expect(
      await canvas.findByText(/^홈 섹션$|^Home sections$/),
    ).toBeVisible();
  },
};

export const UpdateHomeSection: Story = {
  name: 'Update Home Section',
  beforeEach: () => {
    updateHomeSectionScenario.reset();
  },
  parameters: { msw: { handlers: updateHomeSectionScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const sectionFormHeading = await canvas.findByRole('heading', {
      name: /^섹션 수정$|^Edit section$/,
    });
    const sectionForm = within(
      sectionFormHeading.closest('form') as HTMLFormElement,
    );
    const titleInput = sectionForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatedHomeSection.title);
    await userEvent.click(
      sectionForm.getByRole('button', {
        name: /^섹션 저장$|^Save section$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션 수정 완료: Storybook Home Section$|^Home section updated: Storybook Home Section$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('button', {
        name: /^Storybook Home Section/,
      }),
    ).toBeVisible();
  },
};

export const HomeSectionSaveError: Story = {
  name: 'Home Section Save Error',
  parameters: { msw: { handlers: homeSectionSaveErrorHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const sectionFormHeading = await canvas.findByRole('heading', {
      name: /^섹션 수정$|^Edit section$/,
    });
    const sectionForm = within(
      sectionFormHeading.closest('form') as HTMLFormElement,
    );
    const titleInput = sectionForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Save Error Home Section');
    await userEvent.click(
      sectionForm.getByRole('button', {
        name: /^섹션 저장$|^Save section$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션을 수정할 수 없습니다\.$|^Could not update the home section\.$/,
      ),
    ).toBeVisible();
  },
};

export const UpdateHomeCard: Story = {
  name: 'Update Home Card',
  beforeEach: () => {
    updateHomeCardScenario.reset();
  },
  parameters: { msw: { handlers: updateHomeCardScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 수정$|^Edit card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);
    const titleInput = cardForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatedHomeCard.title);
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 저장$|^Save card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 카드 수정 완료: Storybook Updated Card$|^Home card updated completed: Storybook Updated Card$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Updated Card/ }),
    ).toBeVisible();
  },
};

export const CreateHomeCard: Story = {
  name: 'Create Home Card',
  beforeEach: () => {
    createHomeCardScenario.reset();
  },
  parameters: { msw: { handlers: createHomeCardScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /^카드 추가$|^Add card$/,
      }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 추가$|^Add card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);

    await userEvent.type(
      cardForm.getByRole('textbox', { name: /^제목$|^Title$/ }),
      createdHomeCard.title,
    );
    await userEvent.type(
      cardForm.getByRole('textbox', {
        name: /^이미지 URL$|^Image URL$/,
      }),
      createdHomeCard.image_url,
    );
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 추가$|^Add card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 카드 추가 완료: Storybook New Card$|^Home card created completed: Storybook New Card$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook New Card/ }),
    ).toBeVisible();
  },
};

export const HomeCardSaveError: Story = {
  name: 'Home Card Save Error',
  parameters: { msw: { handlers: homeCardSaveErrorHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 수정$|^Edit card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);
    const titleInput = cardForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Save Error Home Card');
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 저장$|^Save card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션 아이템을 수정할 수 없습니다\.$|^Could not update the home section item\.$/,
      ),
    ).toBeVisible();
  },
};

export const OpenProductsTab: Story = {
  name: 'Open Products Tab',
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    await expect(
      await canvas.findByRole('heading', {
        name: /^상품 목록$|^Products$/,
      }),
    ).toBeVisible();
  },
};

export const UpdateProduct: Story = {
  name: 'Update Product',
  beforeEach: () => {
    updateProductScenario.reset();
  },
  parameters: { msw: { handlers: updateProductScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 수정$|^Edit product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, updatedProduct.name_ko);
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 수정 완료: ID 201 \/ 상품명: Storybook Updated Product$|^Product updated completed: ID 201 \/ Name: Storybook Updated Product$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Updated Product/ }),
    ).toBeVisible();
  },
};

export const CreateProduct: Story = {
  name: 'Create Product',
  beforeEach: () => {
    createProductScenario.reset();
  },
  parameters: { msw: { handlers: createProductScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: /^신규$|^New$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 추가$|^Add product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^English name$/,
    });
    const searchKeywordInput = productForm.queryByRole('textbox', {
      name: /^검색 키워드$|^Search keyword$/,
    });

    await userEvent.type(nameInput, createdProduct.name_ko);
    await userEvent.type(
      productForm.getByRole('textbox', { name: /^슬러그$|^Slug$/ }),
      createdProduct.slug,
    );
    if (searchKeywordInput) {
      await userEvent.type(searchKeywordInput, createdProduct.search_keyword);
    }
    await userEvent.type(
      productForm.getByRole('spinbutton', { name: /^가격$|^Price$/ }),
      String(createdProduct.price),
    );
    await userEvent.type(
      productForm.getByRole('textbox', { name: /^설명$|^Description$/ }),
      createdProduct.description,
    );
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 추가 완료: ID 202 \/ 상품명: Storybook Created Product$|^Product created completed: ID 202 \/ Name: Storybook Created Product$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Created Product/ }),
    ).toBeVisible();
  },
};

export const ProductSaveError: Story = {
  name: 'Product Save Error',
  parameters: { msw: { handlers: productSaveErrorHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 수정$|^Edit product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Save Error Product');
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품을 수정할 수 없습니다\.$|^Could not update the product\.$/,
      ),
    ).toBeVisible();
    await expect(nameInput).toHaveValue('Save Error Product');
  },
};

export const DeleteProduct: Story = {
  name: 'Delete Product',
  beforeEach: () => {
    deleteProductScenario.reset();
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: { msw: { handlers: deleteProductScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productRow = await canvas.findByRole('row', { name: /201/ });

    await userEvent.click(
      within(productRow).getByRole('button', { name: /^삭제$|^Delete$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 삭제 완료: ID 201 \/ 상품명: 아크 원 기계식 키보드$|^Product deleted: ID 201 \/ Name: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(
        canvas.queryByRole('row', { name: /201/ }),
      ).not.toBeInTheDocument();
    });

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 추가$|^Add product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );

    await expect(
      productForm.getByRole('textbox', {
        name: /^한글 이름$|^English name$/,
      }),
    ).toHaveValue('');
  },
};

export const ProductDeleteError: Story = {
  name: 'Product Delete Error',
  beforeEach: () => {
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: { msw: { handlers: productDeleteErrorHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productRow = await canvas.findByRole('row', { name: /201/ });

    await userEvent.click(
      within(productRow).getByRole('button', { name: /^삭제$|^Delete$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품을 삭제할 수 없습니다\.$|^Could not delete the product\.$/,
      ),
    ).toBeVisible();
    await expect(productRow).toBeVisible();
  },
};

export const OpenReviewsTab: Story = {
  name: 'Open Reviews Tab',
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    await expect(
      await canvas.findByText(/^상품평 목록$|^Reviews$/),
    ).toBeVisible();
  },
};

export const HideReview: Story = {
  name: 'Hide Review',
  beforeEach: () => {
    hideReviewScenario.reset();
  },
  parameters: { msw: { handlers: hideReviewScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });

    await userEvent.click(hideButton);

    await expect(
      await canvas.findByText(
        /^상품평 숨김 처리 완료: ID 801 \/ 상품명 아크 원 기계식 키보드$|^Review hidden completed: ID 801 \/ Product: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();

    const restoreButton = await canvas.findByRole('button', {
      name: /^복원$|^Restore$/,
    });
    const hiddenReviewRow = restoreButton.closest('tr') as HTMLTableRowElement;

    await expect(
      within(hiddenReviewRow).getByText(/^숨김$|^Hidden$/),
    ).toBeVisible();

    const visibleReviewSummary = canvas.getByText(
      /^상품평 공개$|^Visible reviews$/,
    ).parentElement;

    await expect(
      within(visibleReviewSummary as HTMLElement).getByText('0'),
    ).toBeVisible();
  },
};

export const ShowReview: Story = {
  name: 'Show Review',
  beforeEach: () => {
    showReviewScenario.reset();
  },
  parameters: { msw: { handlers: showReviewScenario.handlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const restoreButton = await canvas.findByRole('button', {
      name: /^복원$|^Restore$/,
    });

    await userEvent.click(restoreButton);

    await expect(
      await canvas.findByText(
        /^상품평 복원 완료: ID 801 \/ 상품명 아크 원 기계식 키보드$|^Review restored completed: ID 801 \/ Product: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });
    const visibleReviewRow = hideButton.closest('tr') as HTMLTableRowElement;

    await expect(
      within(visibleReviewRow).getByText(/^공개$|^Visible$/),
    ).toBeVisible();

    const visibleReviewSummary = canvas.getByText(
      /^상품평 공개$|^Visible reviews$/,
    ).parentElement;

    await expect(
      within(visibleReviewSummary as HTMLElement).getByText('1'),
    ).toBeVisible();
  },
};

export const ReviewStatusError: Story = {
  name: 'Review Status Error',
  parameters: { msw: { handlers: reviewStatusErrorHandlers } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });
    const reviewRow = hideButton.closest('tr') as HTMLTableRowElement;

    await userEvent.click(hideButton);

    await expect(
      await canvas.findByText(
        /^요청 처리에 실패했습니다\. 잠시 후 다시 시도해주세요\.$|^The request failed\. Please try again later\.$/,
      ),
    ).toBeVisible();
    await expect(within(reviewRow).getByText(/^공개$|^Visible$/)).toBeVisible();
    await expect(
      within(reviewRow).getByRole('button', { name: /^숨김$|^Hidden$/ }),
    ).toBeVisible();
  },
};
