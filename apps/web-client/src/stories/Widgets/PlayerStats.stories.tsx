import type { Meta, StoryObj } from '@storybook/react';
import PlayerStats from '../../components/Widgets/PlayerStats';

const meta: Meta<typeof PlayerStats> = {
  title: 'Widgets/PlayerStats',
  component: PlayerStats,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayerStats>;

export const PlayerInGameStatistics: Story = {
  args: {
    loading: false,
    error: null,
    statsData: {
      rank: 'Prestigio IV (Diamante)',
      money: '124,500 💎',
      playtime: '142 horas',
      member_since: '12 de Enero de 2026',
      kills: 48,
      mob_kills: 1850,
      deaths: 12,
      blocks_mined: 34500,
      blocks_placed: 18900,
    },
  },
};

export const LoadingStatsState: Story = {
  args: {
    loading: true,
    error: null,
    statsData: null,
  },
};
