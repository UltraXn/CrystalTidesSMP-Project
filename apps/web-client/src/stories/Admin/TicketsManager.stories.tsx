import type { Meta, StoryObj } from '@storybook/react';
import TicketsManager from '../../components/Admin/TicketsManager';

const meta: Meta<typeof TicketsManager> = {
  title: 'Admin/TicketsManager',
  component: TicketsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TicketsManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <TicketsManager />
    </div>
  )
};
