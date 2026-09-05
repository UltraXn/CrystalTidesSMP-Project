import type { Meta, StoryObj } from '@storybook/react';
import { RewardsPage } from '../../components/Launcher/RewardsPage';

const meta: Meta<typeof RewardsPage> = {
  title: 'Launcher/RewardsPage',
  component: RewardsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RewardsPage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <RewardsPage />
    </div>
  )
};
