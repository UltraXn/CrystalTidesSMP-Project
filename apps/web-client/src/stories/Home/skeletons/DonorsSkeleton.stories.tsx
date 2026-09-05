import type { Meta, StoryObj } from '@storybook/react';
import DonorsSkeleton from '../../../components/Home/skeletons/DonorsSkeleton';

const meta = {
  title: 'Components/Home/skeletons/DonorsSkeleton',
  component: DonorsSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DonorsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
