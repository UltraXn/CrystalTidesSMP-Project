import type { Meta, StoryObj } from '@storybook/react';
import PlayerStatsGrid from '../../components/User/PlayerStatsGrid';

const meta: Meta<typeof PlayerStatsGrid> = {
  title: 'User/PlayerStatsGrid',
  component: PlayerStatsGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayerStatsGrid>;

export const PublicProfileStats: Story = {
  args: {
    loading: false,
    isPublic: true,
    isAdmin: false,
    stats: {
      playtime: '142h 30m',
      kills: 48,
      mob_kills: 1850,
      deaths: 12,
      money: '124,500',
      blocks_mined: '34500',
      blocks_placed: '18900',
      rank: 'Prestigio III (Oro)',
    },
  },
};

export const AdminViewStats: Story = {
  args: {
    loading: false,
    isPublic: false,
    isAdmin: true,
    stats: {
      playtime: '520h 15m',
      kills: 4500,
      mob_kills: 12000,
      deaths: 85,
      money: '890,000',
      blocks_mined: '210000',
      blocks_placed: '180000',
      rank: 'Prestigio V (Iridium)',
    },
  },
};

export const LoadingState: Story = {
  args: {
    loading: true,
    isPublic: true,
    isAdmin: false,
    stats: null,
  },
};
