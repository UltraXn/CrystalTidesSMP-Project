import type { Meta, StoryObj } from '@storybook/react';
import PollsManager from '../../components/Admin/PollsManager';

const meta: Meta<typeof PollsManager> = {
  title: 'Admin/PollsManager',
  component: PollsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollsManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PollsManager />
    </div>
  )
};
