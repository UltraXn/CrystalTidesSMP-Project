import type { Meta, StoryObj } from '@storybook/react';
import EventsManager from '../../components/Admin/EventsManager';

const meta: Meta<typeof EventsManager> = {
  title: 'Admin/EventsManager',
  component: EventsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventsManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <EventsManager />
    </div>
  )
};
