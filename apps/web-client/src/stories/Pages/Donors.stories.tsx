import type { Meta, StoryObj } from '@storybook/react';
import Donors from '../../pages/Donors';

const meta = {
  title: 'Pages/Donors',
  component: Donors,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Donors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
