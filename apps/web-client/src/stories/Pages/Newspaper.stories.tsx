import type { Meta, StoryObj } from '@storybook/react';
import Newspaper from '../../pages/Newspaper';

const meta = {
  title: 'Pages/Newspaper',
  component: Newspaper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Newspaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
