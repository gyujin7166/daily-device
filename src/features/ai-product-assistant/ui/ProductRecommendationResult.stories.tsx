import {
  noCandidatesResult,
  recommendedResult,
  resultWithNotices,
  similarColorResult,
  specEvidenceResult,
  unavailableColorResult,
} from './AiProductAssistant.storyFixtures';
import ProductRecommendationResult from './ProductRecommendationResult';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/AiProductAssistant/ProductRecommendationResult',
  component: ProductRecommendationResult,
  tags: ['autodocs'],
  args: recommendedResult,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ProductRecommendationResult>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNotices: Story = {
  name: 'With Notices',
  args: resultWithNotices,
};

export const NoCandidates: Story = {
  name: 'No Candidates',
  args: noCandidatesResult,
};

export const SimilarColors: Story = {
  name: 'Similar Colors',
  args: similarColorResult,
};

export const UnavailableColors: Story = {
  name: 'Unavailable Colors',
  args: unavailableColorResult,
};

export const SpecEvidence: Story = {
  name: 'Spec Evidence',
  args: specEvidenceResult,
};
