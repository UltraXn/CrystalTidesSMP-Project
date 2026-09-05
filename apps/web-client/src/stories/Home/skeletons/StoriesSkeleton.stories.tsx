import type { Meta, StoryObj } from '@storybook/react';
import StoriesSkeleton from '../../../components/Home/skeletons/StoriesSkeleton';

const meta = {
  title: 'Components/Home/skeletons/StoriesSkeleton',
  component: StoriesSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StoriesSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
