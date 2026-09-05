import type { Meta, StoryObj } from '@storybook/react';
import ForumThread from '../../pages/ForumThread';

const meta = {
  title: 'Pages/ForumThread',
  component: ForumThread,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ForumThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
