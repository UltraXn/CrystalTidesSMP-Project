import type { Meta, StoryObj } from '@storybook/react';
import Maintenance from '../../pages/Maintenance';

const meta = {
  title: 'Pages/Maintenance',
  component: Maintenance,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Maintenance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
