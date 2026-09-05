import type { Meta, StoryObj } from '@storybook/react';
import AboutRolesSkeleton from '../../../components/Home/skeletons/AboutRolesSkeleton';

const meta = {
  title: 'Components/Home/skeletons/AboutRolesSkeleton',
  component: AboutRolesSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutRolesSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
