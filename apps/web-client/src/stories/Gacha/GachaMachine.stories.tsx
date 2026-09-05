import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { GachaMachine } from '../../pages/Gacha/GachaMachine';
import { GachaReward, GachaTier } from '../../pages/Gacha/types';
import { Sparkles, Flame, Shield, Star } from 'lucide-react';

const mockTier: GachaTier = {
  id: 'ultra',
  name: 'Cofre Calamity Supremo',
  color: '#f59e0b',
  icon: '👑',
  cost: 1500,
  rewards: []
};

const mockReelItems: GachaReward[][] = [
  [
    { id: '1', name: 'Espada Calamity', rarity: 'legendary', color: '#f59e0b', image_url: null },
    { id: '2', name: 'Coraza Abisal', rarity: 'epic', color: '#8b5cf6', image_url: null },
    { id: '3', name: '500 KC', rarity: 'rare', color: '#3b82f6', image_url: null },
    { id: '4', name: 'Poción Mayor', rarity: 'common', color: '#6b7280', image_url: null }
  ],
  [
    { id: '5', name: 'Alas del Vencedor', rarity: 'legendary', color: '#f59e0b', image_url: null },
    { id: '6', name: 'Yelmo de Fuego', rarity: 'epic', color: '#8b5cf6', image_url: null },
    { id: '7', name: 'Totem Ancestral', rarity: 'rare', color: '#3b82f6', image_url: null },
    { id: '8', name: 'Frasco de XP', rarity: 'common', color: '#6b7280', image_url: null }
  ],
  [
    { id: '9', name: 'Corona del Nether', rarity: 'legendary', color: '#f59e0b', image_url: null },
    { id: '10', name: 'Botas Abisales', rarity: 'epic', color: '#8b5cf6', image_url: null },
    { id: '11', name: '250 KC', rarity: 'rare', color: '#3b82f6', image_url: null },
    { id: '12', name: 'Carne Podrida', rarity: 'common', color: '#6b7280', image_url: null }
  ]
];

const meta: Meta<typeof GachaMachine> = {
  title: 'Pages/Gacha/GachaMachine',
  component: GachaMachine,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaMachine>;

function IdleGachaMachineComponent() {
  const reel1 = useRef<HTMLDivElement | null>(null);
  const reel2 = useRef<HTMLDivElement | null>(null);
  const reel3 = useRef<HTMLDivElement | null>(null);

  return (
    <div style={{ padding: '2rem', background: '#0b0c10', borderRadius: '16px' }}>
      <GachaMachine
        reelItemsSet={mockReelItems}
        reelRefs={[reel1, reel2, reel3]}
        isOpening={false}
        RARITY_ICONS={{
          legendary: Sparkles,
          epic: Flame,
          rare: Shield,
          common: Star
        }}
        selectedTier={mockTier}
      />
    </div>
  );
}

function SpinningGachaMachineComponent() {
  const reel1 = useRef<HTMLDivElement | null>(null);
  const reel2 = useRef<HTMLDivElement | null>(null);
  const reel3 = useRef<HTMLDivElement | null>(null);

  return (
    <div style={{ padding: '2rem', background: '#0b0c10', borderRadius: '16px' }}>
      <GachaMachine
        reelItemsSet={mockReelItems}
        reelRefs={[reel1, reel2, reel3]}
        isOpening={true}
        RARITY_ICONS={{
          legendary: Sparkles,
          epic: Flame,
          rare: Shield,
          common: Star
        }}
        selectedTier={mockTier}
      />
    </div>
  );
}

export const IdleState: Story = {
  render: () => <IdleGachaMachineComponent />
};

export const SpinningAnimationState: Story = {
  render: () => <SpinningGachaMachineComponent />
};
