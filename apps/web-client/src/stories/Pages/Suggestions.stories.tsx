import type { Meta, StoryObj } from '@storybook/react';
import Suggestions from '../../pages/Suggestions';

const meta = {
  title: 'Pages/Suggestions',
  component: Suggestions,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
