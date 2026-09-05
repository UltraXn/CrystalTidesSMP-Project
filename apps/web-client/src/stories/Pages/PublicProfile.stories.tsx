import type { Meta, StoryObj } from '@storybook/react';
import PublicProfile from '../../pages/PublicProfile';

const meta = {
  title: 'Pages/PublicProfile',
  component: PublicProfile,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PublicProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
