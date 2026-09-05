import type { Meta, StoryObj } from '@storybook/react';
import Rules from '../../pages/Rules';

const meta = {
  title: 'Pages/Rules',
  component: Rules,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Rules>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
