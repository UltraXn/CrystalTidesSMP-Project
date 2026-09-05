import type { Meta, StoryObj } from '@storybook/react';
import SuggestionsSkeleton from '../../../components/Home/skeletons/SuggestionsSkeleton';

const meta = {
  title: 'Components/Home/skeletons/SuggestionsSkeleton',
  component: SuggestionsSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SuggestionsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
