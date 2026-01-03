import type { Meta, StoryObj } from '@storybook/react-vite';
import WikiArticleList from '../../components/Admin/Wiki/WikiArticleList';

const meta: Meta<typeof WikiArticleList> = {
  title: 'Admin/Wiki/WikiArticleList',
  component: WikiArticleList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WikiArticleList>;

const MOCK_ARTICLES = [
    { id: 1, title: 'Comandos Básicos', slug: 'comandos-basicos', category: 'Comandos', content: 'Lista de comandos para usuarios...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Sistema de Economía', slug: 'economia', category: 'Economía', content: 'Cómo funciona el dinero en el servidor...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'Protección de Terrenos', slug: 'protecciones', category: 'Mecánicas', content: 'Guía para proteger tu casa...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const Default: Story = {
    args: {
        articles: MOCK_ARTICLES,
        loading: false,
        onEdit: (article) => console.log('Edit', article),
        onDelete: (id) => console.log('Delete', id),
    }
};

export const Empty: Story = {
    args: {
        articles: [],
        loading: false,
        onEdit: () => {},
        onDelete: () => {},
    }
};

export const Loading: Story = {
    args: {
        articles: [],
        loading: true,
        onEdit: () => {},
        onDelete: () => {},
    }
};
