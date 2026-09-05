import type { Meta, StoryObj } from '@storybook/react';
import ForumCategory from '../../pages/ForumCategory';

const meta = {
  title: 'Pages/ForumCategory',
  component: ForumCategory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ForumCategory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
