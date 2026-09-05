import type { Meta, StoryObj } from '@storybook/react';
import WikiManager from '../../components/Admin/WikiManager';

const meta: Meta<typeof WikiManager> = {
  title: 'Admin/WikiManager',
  component: WikiManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <WikiManager />
    </div>
  )
};
