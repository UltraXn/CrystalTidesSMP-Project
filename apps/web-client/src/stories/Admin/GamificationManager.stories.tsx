import type { Meta, StoryObj } from '@storybook/react';
import GamificationManager from '../../components/Admin/GamificationManager';

const meta: Meta<typeof GamificationManager> = {
  title: 'Admin/GamificationManager',
  component: GamificationManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GamificationManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <GamificationManager />
    </div>
  )
};
