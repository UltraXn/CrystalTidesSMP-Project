import type { Meta, StoryObj } from '@storybook/react';
import CreateThread from '../../pages/CreateThread';

const meta = {
  title: 'Pages/CreateThread',
  component: CreateThread,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
