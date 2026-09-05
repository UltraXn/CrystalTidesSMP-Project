import type { Meta, StoryObj } from '@storybook/react';
import ServerHistorySkeleton from '../../../components/Home/skeletons/ServerHistorySkeleton';

const meta = {
  title: 'Components/Home/skeletons/ServerHistorySkeleton',
  component: ServerHistorySkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServerHistorySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
