import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossMetadataFields } from '../../../../components/Admin/Wiki/BossForm/BossMetadataFields';
import { WikiArticle } from '../../../../services/wikiService';

const mockBossArticle: Partial<WikiArticle> = {
  id: 1,
  title: 'The Harbinger',
  category: 'boss',
  boss_hp: '1000 HP',
  boss_damage: '60 Daño Láser',
  boss_tier: 'Jefe Supremo de Mazmorra',
  boss_location: 'Fábrica Ancestral Hundida'
};

const meta: Meta<typeof BossMetadataFields> = {
  title: 'Admin/Wiki/BossForm/BossMetadataFields',
  component: BossMetadataFields,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossMetadataFields>;

function BossMetadataFieldsComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockBossArticle);
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossMetadataFields
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <BossMetadataFieldsComponent />
};
