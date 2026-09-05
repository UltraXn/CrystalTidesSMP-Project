import type { Meta, StoryObj } from '@storybook/react';
import UsersManager from '../../components/Admin/UsersManager';

const meta: Meta<typeof UsersManager> = {
  title: 'Admin/UsersManager',
  component: UsersManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UsersManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <UsersManager />
    </div>
  )
};
