import type { Meta, StoryObj } from '@storybook/react';
import Forum from '../../pages/Forum';

const meta = {
  title: 'Pages/Forum',
  component: Forum,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Forum>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
