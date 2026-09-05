import type { Meta, StoryObj } from '@storybook/react';
import SuggestionCard from '../../../components/Admin/Suggestions/SuggestionCard';

const meta: Meta<typeof SuggestionCard> = {
  title: 'AdminSuggestions/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionCard>;

export const PendingBugReport: Story = {
  args: {
    suggestion: {
      id: 1,
      type: 'bug',
      nickname: 'KilluBysmali',
      message: 'Los bloques de cristal no emiten luz después de la actualización v2.4.0. Antes funcionaba correctamente en el bioma abisal.',
      created_at: '2026-08-09T10:30:00Z',
      status: 'pending',
      votes: 12,
    },
    isExpanded: false,
    onToggleExpand: () => {},
    onUpdateStatus: () => {},
    onDelete: () => {},
  },
};

export const ApprovedModSuggestion: Story = {
  args: {
    suggestion: {
      id: 2,
      type: 'mod',
      nickname: 'BuilderPro',
      message: 'Sería genial agregar el mod de Chisel & Bits para permitir construcciones detalladas a nivel de sub-bloque.',
      created_at: '2026-08-05T14:20:00Z',
      status: 'approved',
      votes: 34,
    },
    isExpanded: true,
    onToggleExpand: () => {},
    onUpdateStatus: () => {},
    onDelete: () => {},
  },
};

export const ImplementedGeneralIdea: Story = {
  args: {
    suggestion: {
      id: 3,
      type: 'general',
      nickname: 'ExplorerKing',
      message: 'Agregar un sistema de waypoints compartidos entre miembros del mismo Reino para facilitar la navegación.',
      created_at: '2026-07-20T09:00:00Z',
      status: 'implemented',
      votes: 58,
    },
    isExpanded: false,
    onToggleExpand: () => {},
    onUpdateStatus: () => {},
    onDelete: () => {},
  },
};
