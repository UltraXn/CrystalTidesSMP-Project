import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminDocs from '../../components/Admin/AdminDocs';
import { Book } from 'lucide-react';

const meta: Meta<typeof AdminDocs> = {
  title: 'Admin/AdminDocs',
  component: AdminDocs,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#09090b', padding: '2rem', height: '100vh', boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminDocs>;

const MOCK_DOCS = [
    {
        id: 'intro',
        title: 'Introducción',
        icon: Book,
        content: `
# Introducción

Esta es una versión de prueba de la documentación cargada desde Storybook.

### Características
- **Mocks**: No depende de la base de datos.
- **Edición**: Puedes probar el editor Markdown aquí mismo (los cambios no se guardan en BD).
        `
    },
    {
        id: 'guide',
        title: 'Guía de Estilo',
        icon: Book,
        content: `
# Guía de Estilo

Colores y formatos usados en el panel.

- **Primary**: #22c55e (Green)
- **Danger**: #ef4444 (Red)
        `
    }
];

export const Default: Story = {
    args: {
        mockDocs: MOCK_DOCS
    }
};

export const Loading: Story = {
    render: () => <AdminDocs /> // Will default to loading/fetching since no mockDocs provided
};
