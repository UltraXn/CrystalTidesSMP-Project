import type { Meta, StoryObj } from '@storybook/react';
import Gacha from '../../pages/Gacha';

const meta = {
  title: 'Pages/Gacha',
  component: Gacha,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Gacha>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
