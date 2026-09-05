import type { Meta, StoryObj } from '@storybook/react';
import ContestsSkeleton from '../../../components/Home/skeletons/ContestsSkeleton';

const meta = {
  title: 'Components/Home/skeletons/ContestsSkeleton',
  component: ContestsSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContestsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
