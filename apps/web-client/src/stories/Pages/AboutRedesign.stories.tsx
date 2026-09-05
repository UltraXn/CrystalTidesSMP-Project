import type { Meta, StoryObj } from '@storybook/react';
import AboutRedesign from '../../pages/AboutRedesign';

const meta = {
  title: 'Pages/AboutRedesign',
  component: AboutRedesign,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutRedesign>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
