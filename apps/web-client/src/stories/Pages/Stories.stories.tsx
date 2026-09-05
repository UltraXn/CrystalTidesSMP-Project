import type { Meta, StoryObj } from '@storybook/react';
import Stories from '../../pages/Stories';

const meta = {
  title: 'Pages/Stories',
  component: Stories,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stories>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
