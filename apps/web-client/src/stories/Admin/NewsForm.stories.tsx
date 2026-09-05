import type { Meta, StoryObj } from '@storybook/react';
import NewsForm from '../../components/Admin/NewsForm';
import { NewsFormValues } from '../../schemas/news';
import { User } from '@supabase/supabase-js';

const mockUser = {
  id: 'usr-admin-01',
  email: 'admin@crystaltidessmp.net',
  app_metadata: { role: 'admin' },
  user_metadata: { full_name: 'NeroFerno' },
  aud: 'authenticated',
  created_at: new Date().toISOString()
} as unknown as User;

const mockNewsArticle: NewsFormValues = {
  title: 'Apertura de la Mazmorra del Fuego y Boss Ignis',
  title_en: 'Opening of Fire Dungeon and Boss Ignis',
  content: `¡Aventureros de CrystalTides!
La dimensión del Nether ha temblado y las puertas del Altar de Llamas Eternas se han abierto.

Reúnan a sus clanes, preparen sus armaduras y enfrenten a Ignis.`,
  content_en: `Adventurers of CrystalTides!
The Nether dimension has trembled and the gates of the Eternal Flame Altar are open.

Gather your clans, equip your armor and face Ignis.`,
  category: 'Eventos',
  status: 'Published',
  image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
};

const meta: Meta<typeof NewsForm> = {
  title: 'Admin/NewsForm',
  component: NewsForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NewsForm>;

export const EditExistingNews: Story = {
  args: {
    initialData: mockNewsArticle,
    onSave: async (data) => console.log('Save news form:', data),
    onCancel: () => console.log('Cancel edit'),
    user: mockUser
  }
};

export const CreateNewArticle: Story = {
  args: {
    onSave: async (data) => console.log('Create news article:', data),
    onCancel: () => console.log('Cancel create'),
    user: mockUser
  }
};
