import type { Meta, StoryObj } from '@storybook/react';
import index from '../../pages/Gacha/index';

const meta = {
  title: 'Pages/Gacha/index',
  component: index,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof index>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
