import type { Meta, StoryObj } from '@storybook/react';
import AdminPanel from '../../pages/AdminPanel';

const meta = {
  title: 'Pages/AdminPanel',
  component: AdminPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdminPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
