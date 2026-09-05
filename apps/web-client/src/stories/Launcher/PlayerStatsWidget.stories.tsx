import type { Meta, StoryObj } from '@storybook/react';
import { PlayerStatsWidget } from '../../components/Launcher/PlayerStatsWidget';

const meta: Meta<typeof PlayerStatsWidget> = {
  title: 'Launcher/PlayerStatsWidget',
  component: PlayerStatsWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayerStatsWidget>;

export const TopRankedPlayerStats: Story = {
  args: {
    username: 'NeroFerno',
  },
  render: (args) => (
    <div style={{ maxWidth: '650px', margin: '0 auto', background: '#0e1017', padding: '1.5rem', borderRadius: '16px' }}>
      <PlayerStatsWidget {...args} />
    </div>
  )
};

export const StandardPlayerStats: Story = {
  args: {
    username: 'Steve',
  },
  render: (args) => (
    <div style={{ maxWidth: '650px', margin: '0 auto', background: '#0e1017', padding: '1.5rem', borderRadius: '16px' }}>
      <PlayerStatsWidget {...args} />
    </div>
  )
};
