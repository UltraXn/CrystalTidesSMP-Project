import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossSkillsTab } from '../../../../components/Admin/Wiki/BossForm/BossSkillsTab';
import { WikiArticle } from '../../../../services/wikiService';

const mockBossPhasesData: Partial<WikiArticle> = {
  id: 1,
  title: 'Ignis',
  category: 'boss',
  boss_hp: '800 HP',
  boss_hp_phase_2: '1200 HP',
  boss_damage: '45 Daño',
  boss_damage_phase_2: '75 Daño Crítico',
  boss_phases: [
    {
      phase_number: 1,
      phase_name: 'Fase I: Señor de las Cenizas',
      model_3d_url: '',
      hp: '800 HP',
      damage: '45 Daño',
      attacks: [
        { name: 'Golpe Devastador', type: 'Físico', damage: '45 HP', description: 'Golpea el suelo con su espada ígnea.' },
        { name: 'Lluvia de Meteoros', type: 'Mágico', damage: '30 HP', description: 'Convoca meteoritos ardientes del cielo.' },
        { name: 'Pilar de Fuego', type: 'Mágico', damage: '40 HP', description: 'Levanta columnas de fuego en cruz.' }
      ]
    },
    {
      phase_number: 2,
      phase_name: 'Fase II: Despertar del Caos',
      model_3d_url: '',
      hp: '1200 HP',
      damage: '75 Daño Crítico',
      attacks: [
        { name: 'Explosión Supernova', type: 'Mágico', damage: '80 HP', description: 'Detonación masiva en 360 grados.' },
        { name: 'Carga Ígnea', type: 'Físico', damage: '60 HP', description: 'Embestida frontal de alta velocidad.' },
        { name: 'Tierra Calcinada', type: 'Mágico', damage: '50 HP', description: 'Convierte el suelo en magma temporal.' }
      ]
    }
  ]
};

const meta: Meta<typeof BossSkillsTab> = {
  title: 'Admin/Wiki/BossForm/BossSkillsTab',
  component: BossSkillsTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossSkillsTab>;

function BossSkillsTabComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockBossPhasesData);
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossSkillsTab formData={formData} setFormData={setFormData} />
    </div>
  );
}

export const Default: Story = {
  render: () => <BossSkillsTabComponent />
};
