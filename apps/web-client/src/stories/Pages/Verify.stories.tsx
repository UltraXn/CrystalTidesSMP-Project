import type { Meta, StoryObj } from '@storybook/react';
import Verify from '../../pages/Verify';

const meta = {
  title: 'Pages/Verify',
  component: Verify,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Verify>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
