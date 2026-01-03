import type { Meta, StoryObj } from '@storybook/react';
import SuggestionCard from '../../components/Admin/Suggestions/SuggestionCard';
import { Suggestion } from '../../components/Admin/Suggestions/types';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Admin/Suggestions/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionCard>;

const mockSuggestion: Suggestion = {
    id: 1,
    type: 'General',
    nickname: 'Neroferno',
    message: 'Esto es una sugerencia de prueba para verificar cómo se ve el componente en diferentes estados.',
    created_at: new Date().toISOString(),
    status: 'pending'
};

export const Pending: Story = {
  args: {
    suggestion: mockSuggestion,
    isExpanded: false,
    onToggleExpand: () => {},
    onUpdateStatus: (id, s) => console.log('Update', id, s),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const Approved: Story = {
    args: {
      suggestion: { ...mockSuggestion, status: 'approved', message: 'Una sugerencia muy larga que debería mostrar el botón de leer más si estuviera colapsada, pero aquí lo probamos expandido o normal. ' + 'x'.repeat(100) },
      isExpanded: false,
      onToggleExpand: () => {},
      onUpdateStatus: (id, s) => console.log('Update', id, s),
      onDelete: (id) => console.log('Delete', id),
    },
};

export const Expanded: Story = {
    args: {
      suggestion: { ...mockSuggestion, message: 'Una sugerencia muy larga que debería mostrar el botón de leer más si estuviera colapsada. '.repeat(5) },
      isExpanded: true,
      onToggleExpand: () => {},
      onUpdateStatus: (id, s) => console.log('Update', id, s),
      onDelete: (id) => console.log('Delete', id),
    },
};
