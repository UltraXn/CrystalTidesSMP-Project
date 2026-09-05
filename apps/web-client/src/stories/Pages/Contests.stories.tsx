import type { Meta, StoryObj } from '@storybook/react';
import Contests from '../../pages/Contests';

const meta = {
  title: 'Pages/Contests',
  component: Contests,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Contests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
