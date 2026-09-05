import type { Meta, StoryObj } from '@storybook/react';
import Register from '../../pages/Register';

const meta = {
  title: 'Pages/Register',
  component: Register,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Register>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
