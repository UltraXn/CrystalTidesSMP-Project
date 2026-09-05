import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossModelsTab } from '../../../../components/Admin/Wiki/BossForm/BossModelsTab';
import { WikiArticle } from '../../../../services/wikiService';

const mockBossModelsData: Partial<WikiArticle> = {
  id: 1,
  title: 'Netherite Monstrosity',
  boss_entity_type: 'Mod Entity (GeckoLib)',
  boss_mod_name: 'L_Ender\'s Cataclysm',
  boss_tier: 'Jefe Supremo de Mazmorra',
  model_3d_url: '/models/bosses/netherite_monstrosity.gltf',
  model_3d_url_phase_2: '/models/bosses/monstrosity_enraged.gltf'
};

const meta: Meta<typeof BossModelsTab> = {
  title: 'Admin/Wiki/BossForm/BossModelsTab',
  component: BossModelsTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossModelsTab>;

function PopulatedBossModelsComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockBossModelsData);
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossModelsTab
        formData={formData}
        setFormData={setFormData}
        uploadingField={null}
        handleFileUpload={async (file, field) => {
          console.log('Upload file:', file.name, 'to field:', field);
        }}
      />
    </div>
  );
}

export const PopulatedWith3DModels: Story = {
  render: () => <PopulatedBossModelsComponent />
};
