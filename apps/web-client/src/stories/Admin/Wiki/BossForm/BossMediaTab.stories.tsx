import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BossMediaTab } from '../../../../components/Admin/Wiki/BossForm/BossMediaTab';
import { WikiArticle } from '../../../../services/wikiService';

const mockMediaData: Partial<WikiArticle> = {
  id: 1,
  boss_location: 'Altar de Llamas Eternas (Nether)',
  boss_spawn_method: 'Ofrenda de 3 Cenizas de Netherite en el Altar',
  boss_spawn_command: '/mm mobs spawn IgnisBoss 1 Nether',
  boss_kc_reward: 7500
};

const meta: Meta<typeof BossMediaTab> = {
  title: 'Admin/Wiki/BossForm/BossMediaTab',
  component: BossMediaTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BossMediaTab>;

function DefaultMediaComponent() {
  const [formData, setFormData] = useState<Partial<WikiArticle>>(mockMediaData);
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <BossMediaTab
        formData={formData}
        setFormData={setFormData}
        uploadingField={null}
        handleFileUpload={async (file, field) => { console.log('Upload:', file.name, field); }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultMediaComponent />
};
