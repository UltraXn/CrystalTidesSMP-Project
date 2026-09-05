import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { GachaHistory } from '../../pages/Gacha/GachaHistory';
import { GachaHistoryEntry } from '../../pages/Gacha/types';
import { Sparkles, Shield, Flame, Star } from 'lucide-react';

const mockHistory: GachaHistoryEntry[] = [
  {
    id: 'roll-01',
    reward_id: 'rew-legendary-sword',
    reward_name: 'Espada de las Sombras Calamity',
    rarity: 'legendary',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    image_url: '/images/rewards/sword.png'
  },
  {
    id: 'roll-02',
    reward_id: 'rew-epic-armor',
    reward_name: 'Coraza de Netherite Abisal',
    rarity: 'epic',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    image_url: '/images/rewards/armor.png'
  },
  {
    id: 'roll-03',
    reward_id: 'rew-rare-coins',
    reward_name: 'Bolsa de 1,000 Killucoins',
    rarity: 'rare',
    created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    image_url: '/images/killucoin.png'
  },
  {
    id: 'roll-04',
    reward_id: 'rew-common-potion',
    reward_name: 'Frasco de Resistencia al Fuego III',
    rarity: 'common',
    created_at: new Date(Date.now() - 1000 * 3600 * 5).toISOString()
  }
];

const meta: Meta<typeof GachaHistory> = {
  title: 'Pages/Gacha/GachaHistory',
  component: GachaHistory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaHistory>;

function OpenWithRollHistoryComponent() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ padding: '2rem' }}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{ background: '#8b5cf6', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
      >
        Ver Historial de Tiradas
      </button>
      <GachaHistory
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        history={mockHistory}
        loading={false}
        RARITY_ICONS={{
          legendary: Sparkles,
          epic: Flame,
          rare: Shield,
          common: Star
        }}
        RARITY_COLORS={{
          legendary: '#f59e0b',
          epic: '#8b5cf6',
          rare: '#3b82f6',
          common: '#6b7280'
        }}
        tierColor="#8b5cf6"
      />
    </div>
  );
}

function EmptyHistoryComponent() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ padding: '2rem' }}>
      <GachaHistory
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        history={[]}
        loading={false}
        RARITY_ICONS={{
          legendary: Sparkles,
          epic: Flame,
          rare: Shield,
          common: Star
        }}
        RARITY_COLORS={{
          legendary: '#f59e0b',
          epic: '#8b5cf6',
          rare: '#3b82f6',
          common: '#6b7280'
        }}
        tierColor="#3b82f6"
      />
    </div>
  );
}

export const OpenWithRollHistory: Story = {
  render: () => <OpenWithRollHistoryComponent />
};

export const EmptyHistory: Story = {
  render: () => <EmptyHistoryComponent />
};
