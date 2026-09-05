import type { Meta, StoryObj } from '@storybook/react';
import Blog from '../../pages/Blog';

const meta = {
  title: 'Pages/Blog',
  component: Blog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Blog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
