import type { Meta, StoryObj } from '@storybook/react';
import WikiArticleFormModal from '../../../components/Admin/Wiki/WikiArticleFormModal';
import { WikiArticle } from '../../../services/wikiService';

const mockBossArticle: Partial<WikiArticle> = {
  id: 1,
  title: 'Ignis, Señor de las Cenizas',
  slug: 'ignis-boss-cataclysm',
  category: 'boss',
  content: `### Lore y Descripción
Ignis es una entidad ancestral forjada en el núcleo del Nether. Gobierna el Altar de Llamas Eternas.

### Mecánicas de Combate
- **Fase 1**: Ataques cuerpo a cuerpo con barrido de fuego y meteoritos.
- **Fase 2**: Al caer por debajo del 50% de vida, entra en frenesí ígneo invocando pilares de lava.

### Recompensas
- **Espada de Ceniza**: 15% probabilidad de drop.
- **7,500 Killucoins**: Para todos los miembros de la party.`,
  boss_hp: '800 HP',
  boss_damage: '45 Daño',
  boss_tier: 'Jefe Supremo de Mazmorra',
  boss_location: 'Altar de Llamas Eternas (Nether)'
};

const meta: Meta<typeof WikiArticleFormModal> = {
  title: 'Admin/Wiki/WikiArticleFormModal',
  component: WikiArticleFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiArticleFormModal>;

export const EditBossArticle: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close wiki form modal'),
    onSave: async (article) => console.log('Save wiki article:', article),
    initialData: mockBossArticle,
    isEditing: true,
    saving: false
  }
};

export const CreateNewArticle: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close wiki form modal'),
    onSave: async (article) => console.log('Create new wiki article:', article),
    initialData: null,
    isEditing: false,
    saving: false
  }
};

export const SavingState: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close wiki form modal'),
    onSave: async () => {},
    initialData: mockBossArticle,
    isEditing: true,
    saving: true
  }
};
