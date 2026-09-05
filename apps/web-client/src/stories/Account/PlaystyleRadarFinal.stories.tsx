import type { Meta, StoryObj } from '@storybook/react';
import PlaystyleRadarFinal from '../../components/Account/PlaystyleRadarFinal';

const meta: Meta<typeof PlaystyleRadarFinal> = {
  title: 'Account/PlaystyleRadarFinal',
  component: PlaystyleRadarFinal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlaystyleRadarFinal>;

export const BalancedPlayer: Story = {
  args: {
    stats: {
      blocksPlaced: 32000,
      blocksMined: 45000,
      kills: 120,
      mobKills: 2400,
      playtimeHours: 210,
      money: 85000,
      rank: 'Prestigio III (Oro)',
      streakDays: 14,
      distanceKm: 380,
      top1ConstructorScore: 120000,
      top1LuchadorScore: 8000,
      top1MercaderScore: 500000,
      top1ConstanciaScore: 60,
      top1ExploradorScore: 1200,
    },
  },
};

export const PureCombatPlayer: Story = {
  args: {
    stats: {
      blocksPlaced: 2000,
      blocksMined: 5000,
      kills: 4500,
      mobKills: 12000,
      playtimeHours: 380,
      money: 15000,
      rank: 'Prestigio IV (Diamante)',
      streakDays: 30,
      distanceKm: 120,
      isTop1Luchador: true,
      top1ConstructorScore: 120000,
      top1LuchadorScore: 12000,
      top1MercaderScore: 500000,
      top1ConstanciaScore: 60,
      top1ExploradorScore: 1200,
    },
  },
};

export const BuilderSpecialist: Story = {
  args: {
    stats: {
      blocksPlaced: 95000,
      blocksMined: 110000,
      kills: 20,
      mobKills: 300,
      playtimeHours: 500,
      money: 42000,
      rank: 'Prestigio V (Iridium)',
      streakDays: 45,
      distanceKm: 50,
      isTop1Constructor: true,
      top1ConstructorScore: 205000,
      top1LuchadorScore: 8000,
      top1MercaderScore: 500000,
      top1ConstanciaScore: 60,
      top1ExploradorScore: 1200,
    },
  },
};
