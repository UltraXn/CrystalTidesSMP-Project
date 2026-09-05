import type { Meta, StoryObj } from '@storybook/react';
import Map from '../../pages/Map';

const meta = {
  title: 'Pages/Map',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
