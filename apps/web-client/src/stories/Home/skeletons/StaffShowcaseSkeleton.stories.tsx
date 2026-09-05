import type { Meta, StoryObj } from '@storybook/react';
import StaffShowcaseSkeleton from '../../../components/Home/skeletons/StaffShowcaseSkeleton';

const meta = {
  title: 'Components/Home/skeletons/StaffShowcaseSkeleton',
  component: StaffShowcaseSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StaffShowcaseSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
