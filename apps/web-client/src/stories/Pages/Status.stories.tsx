import type { Meta, StoryObj } from '@storybook/react';
import Status from '../../pages/Status';

const meta = {
  title: 'Pages/Status',
  component: Status,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
