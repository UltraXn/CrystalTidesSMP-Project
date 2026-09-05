import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossLabelsTab } from '../../../../components/Admin/Wiki/BossForm/BossLabelsTab';
import { WikiArticle } from '../../../../services/wikiService';

const mockLabelsData: Partial<WikiArticle> = {
  card_theme: 'red',
  threat_label: 'NIVEL DE AMENAZA',
  hp_label: 'SALUD DE COMBATE',
  damage_label: 'PODER DE DAÑO'
};

const meta: Meta<typeof BossLabelsTab> = {
  title: 'Admin/Wiki/BossForm/BossLabelsTab',
  component: BossLabelsTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossLabelsTab>;

function HostileRedThemeComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockLabelsData);
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossLabelsTab formData={formData} setFormData={setFormData} />
    </div>
  );
}

function CompanionEmeraldThemeComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>({
    card_theme: 'emerald',
    threat_label: 'TEMPERAMENTO',
    hp_label: 'SALUD DE MASCOTA',
    damage_label: 'HABILIDAD PASIVA'
  });
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossLabelsTab formData={formData} setFormData={setFormData} />
    </div>
  );
}

export const HostileRedTheme: Story = {
  render: () => <HostileRedThemeComponent />
};

export const CompanionEmeraldTheme: Story = {
  render: () => <CompanionEmeraldThemeComponent />
};
