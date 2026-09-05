import type { Meta, StoryObj } from '@storybook/react';
import BlogSkeleton from '../../../components/Home/skeletons/BlogSkeleton';

const meta = {
  title: 'Components/Home/skeletons/BlogSkeleton',
  component: BlogSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BlogSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
