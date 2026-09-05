import type { Meta, StoryObj } from '@storybook/react';
import RulesSkeleton from '../../../components/Home/skeletons/RulesSkeleton';

const meta = {
  title: 'Components/Home/skeletons/RulesSkeleton',
  component: RulesSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RulesSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
