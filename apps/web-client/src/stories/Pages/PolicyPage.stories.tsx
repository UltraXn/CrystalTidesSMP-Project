import type { Meta, StoryObj } from '@storybook/react';
import PolicyPage from '../../pages/PolicyPage';

const meta = {
  title: 'Pages/PolicyPage',
  component: PolicyPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PolicyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
