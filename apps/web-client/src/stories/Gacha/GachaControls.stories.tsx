import type { Meta, StoryObj } from '@storybook/react';
import { GachaControls } from '../../pages/Gacha/GachaControls';
import { GachaTier } from '../../pages/Gacha/types';

const mockTier: GachaTier = {
  id: 'epic',
  name: 'Cofre Abisal Épico',
  color: '#8b5cf6',
  icon: '🔮',
  cost: 500,
  rewards: [
    { id: 'rew-1', name: 'Espada Calamity', rarity: 'legendary', color: '#f59e0b', image_url: '/images/rewards/sword.png' },
    { id: 'rew-2', name: 'Armadura Abisal', rarity: 'epic', color: '#8b5cf6', image_url: '/images/rewards/armor.png' }
  ]
};

const meta: Meta<typeof GachaControls> = {
  title: 'Pages/Gacha/GachaControls',
  component: GachaControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaControls>;

export const DefaultWithSufficientFunds: Story = {
  args: {
    isOpening: false,
    selectedTier: mockTier,
    killuBalance: 3500,
    rollGacha: (qty: number) => console.log('Roll gacha quantity:', qty),
    formatCost: (num: number) => `${num.toLocaleString()} KC`,
    hasFreeRoll: false
  }
};

export const FreeDailyRollAvailable: Story = {
  args: {
    isOpening: false,
    selectedTier: mockTier,
    killuBalance: 50,
    rollGacha: (qty: number) => console.log('Roll free daily: quantity', qty),
    formatCost: (num: number) => `${num.toLocaleString()} KC`,
    hasFreeRoll: true
  }
};

export const RollingAnimationState: Story = {
  args: {
    isOpening: true,
    selectedTier: mockTier,
    killuBalance: 3000,
    rollGacha: () => {},
    formatCost: (num: number) => `${num.toLocaleString()} KC`,
    hasFreeRoll: false
  }
};
