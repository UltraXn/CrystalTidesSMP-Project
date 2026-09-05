import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossStatsTab } from '../../../../components/Admin/Wiki/BossForm/BossStatsTab';
import { WikiArticle } from '../../../../services/wikiService';

const mockIgnisArticle: Partial<WikiArticle> = {
  id: 1,
  title: 'Ignis, Rey del Fuego Abisal',
  category: 'boss',
  boss_hp: '800 HP',
  boss_hp_phase_2: '1200 HP (Furia Ígnea)',
  boss_damage: '45 (Quemadura Abisal)',
  boss_damage_phase_2: '75 Daño Crítico',
  boss_armor: '30 Armadura (70% Resistencia)',
  boss_speed: '0.35 (Rápido)',
  boss_location: 'Altar de Llamas Eternas (Nether)',
  boss_tier: 'extreme',
  boss_kc_reward: 7500,
  boss_immunities: ['Inmune a Fuego', 'Inmune a Lava']
};

const meta: Meta<typeof BossStatsTab> = {
  title: 'Admin/Wiki/BossForm/BossStatsTab',
  component: BossStatsTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossStatsTab>;

function PopulatedBossStatsComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockIgnisArticle);
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossStatsTab formData={formData} setFormData={setFormData} />
    </div>
  );
}

function EmptyBossStatsComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>({});
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossStatsTab formData={formData} setFormData={setFormData} />
    </div>
  );
}

export const PopulatedWithBossStats: Story = {
  render: () => <PopulatedBossStatsComponent />
};

export const EmptyState: Story = {
  render: () => <EmptyBossStatsComponent />
};
