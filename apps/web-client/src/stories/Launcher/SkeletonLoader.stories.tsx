import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLoader } from '../../components/Launcher/SkeletonLoader';

const meta = {
  title: 'Components/Launcher/SkeletonLoader',
  component: SkeletonLoader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
