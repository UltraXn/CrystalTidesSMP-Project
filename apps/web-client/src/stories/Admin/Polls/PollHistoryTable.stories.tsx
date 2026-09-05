import type { Meta, StoryObj } from '@storybook/react';
import PollHistoryTable from '../../../components/Admin/Polls/PollHistoryTable';

const meta: Meta<typeof PollHistoryTable> = {
  title: 'AdminPolls/PollHistoryTable',
  component: PollHistoryTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollHistoryTable>;

export const PollHistoryWithData: Story = {
  args: {
    loading: false,
    page: 1,
    totalPages: 3,
    onPageChange: () => {},
    onDelete: () => {},
    onClose: () => {},
    polls: [
      {
        id: 1,
        title: 'Expansión del Mapa',
        question: '¿Qué bioma debería tener la próxima expansión?',
        totalVotes: 342,
        is_active: false,
        created_at: '2026-07-15T10:00:00Z',
        closes_at: '2026-07-22T10:00:00Z',
        options: [
          { id: 1, label: 'Bosque de Cristal', votes: 154, percent: 45 },
          { id: 2, label: 'Desierto de Obsidiana', votes: 103, percent: 30 },
        ],
      },
      {
        id: 2,
        title: 'Evento PvP',
        question: '¿Cuándo debería ser el torneo de PvP?',
        totalVotes: 128,
        is_active: true,
        created_at: '2026-08-01T10:00:00Z',
        options: [
          { id: 1, label: 'Sábado 10 PM', votes: 80, percent: 63 },
          { id: 2, label: 'Domingo 4 PM', votes: 48, percent: 37 },
        ],
      },
      {
        id: 3,
        title: 'Nuevo Mob Custom',
        question: '¿Qué criatura nueva quieres ver?',
        totalVotes: 89,
        is_active: false,
        created_at: '2026-06-20T10:00:00Z',
        closes_at: '2026-06-27T10:00:00Z',
        options: [
          { id: 1, label: 'Dragón de Cristal', votes: 55, percent: 62 },
          { id: 2, label: 'Golem de Iridium', votes: 34, percent: 38 },
        ],
      },
    ],
  },
};

export const EmptyPollHistory: Story = {
  args: {
    loading: false,
    page: 1,
    totalPages: 0,
    onPageChange: () => {},
    onDelete: () => {},
    onClose: () => {},
    polls: [],
  },
};

export const LoadingPollHistory: Story = {
  args: {
    loading: true,
    page: 1,
    totalPages: 0,
    onPageChange: () => {},
    onDelete: () => {},
    onClose: () => {},
    polls: [],
  },
};
