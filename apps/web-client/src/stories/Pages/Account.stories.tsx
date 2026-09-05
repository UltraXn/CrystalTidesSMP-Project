import type { Meta, StoryObj } from '@storybook/react';
import Account from '../../pages/Account';

const meta = {
  title: 'Pages/Account',
  component: Account,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Account>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
