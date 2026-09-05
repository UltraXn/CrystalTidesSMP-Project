import type { Meta, StoryObj } from '@storybook/react';
import StatusSkeleton from '../../../components/Home/skeletons/StatusSkeleton';

const meta = {
  title: 'Components/Home/skeletons/StatusSkeleton',
  component: StatusSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatusSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
