import type { Meta, StoryObj } from '@storybook/react';
import ServerHistory from '../../components/Home/ServerHistory';

const meta: Meta<typeof ServerHistory> = {
  title: 'Home/ServerHistory',
  component: ServerHistory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ServerHistory>;

export const Timeline3DHistorySection: Story = {
  render: () => (
    <div style={{ minHeight: '600px', background: '#0b0c10', padding: '2rem' }}>
      <ServerHistory />
    </div>
  ),
};
