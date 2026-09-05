import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { GachaRewardsOverlay } from '../../pages/Gacha/GachaRewardsOverlay';
import { GachaReward, GachaTier } from '../../pages/Gacha/types';

const mockTier: GachaTier = {
  id: 'epic',
  name: 'Cofre Épico',
  color: '#8b5cf6',
  icon: '🔮',
  cost: 500,
  rewards: []
};

const mockBulkRewards: GachaReward[] = [
  { id: '1', name: 'Espada Calamity Tier S', rarity: 'legendary', color: '#f59e0b', image_url: null },
  { id: '2', name: 'Alas Abisales', rarity: 'epic', color: '#8b5cf6', image_url: null },
  { id: '3', name: '500 Killucoins', rarity: 'rare', color: '#3b82f6', image_url: null },
  { id: '4', name: 'Fragmento de Netherite', rarity: 'rare', color: '#3b82f6', image_url: null },
  { id: '5', name: 'Frasco de Experiencia x64', rarity: 'common', color: '#6b7280', image_url: null },
  { id: '6', name: '100 Killucoins', rarity: 'common', color: '#6b7280', image_url: null },
  { id: '7', name: 'Totem de Resurrección', rarity: 'epic', color: '#8b5cf6', image_url: null },
  { id: '8', name: 'Poción de Fuerza IV', rarity: 'common', color: '#6b7280', image_url: null },
  { id: '9', name: 'Corona del Vencedor', rarity: 'legendary', color: '#f59e0b', image_url: null },
  { id: '10', name: '250 Killucoins', rarity: 'rare', color: '#3b82f6', image_url: null }
];

const meta: Meta<typeof GachaRewardsOverlay> = {
  title: 'Pages/Gacha/GachaRewardsOverlay',
  component: GachaRewardsOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaRewardsOverlay>;

function MultiRollOverlayComponent() {
  const [show, setShow] = useState(true);
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0b0c10' }}>
      <button
        type="button"
        onClick={() => setShow(true)}
        style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold', padding: '0.8rem 1.5rem', borderRadius: '12px' }}
      >
        Re-abrir Recompensas x10
      </button>
      <GachaRewardsOverlay
        showBulkRewards={show}
        bulkRewards={mockBulkRewards}
        selectedTier={mockTier}
        setShowBulkRewards={setShow}
      />
    </div>
  );
}

function SingleRollOverlayComponent() {
  const [show, setShow] = useState(true);
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0b0c10' }}>
      <GachaRewardsOverlay
        showBulkRewards={show}
        bulkRewards={[mockBulkRewards[0]]}
        selectedTier={mockTier}
        setShowBulkRewards={setShow}
      />
    </div>
  );
}

export const MultiRollRewardsOverlay: Story = {
  render: () => <MultiRollOverlayComponent />
};

export const SingleRollLegendaryOverlay: Story = {
  render: () => <SingleRollOverlayComponent />
};
