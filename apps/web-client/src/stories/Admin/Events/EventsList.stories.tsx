import type { Meta, StoryObj } from '@storybook/react';
import EventsList from '../../../components/Admin/Events/EventsList';

const meta: Meta<typeof EventsList> = {
  title: 'AdminEvents/EventsList',
  component: EventsList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventsList>;

export const ActiveEventsBoard: Story = {
  args: {
    loading: false,
    onEdit: () => {},
    onDelete: () => {},
    onViewRegistrations: () => {},
    onNew: () => {},
    events: [
      {
        id: 1,
        title: 'Torneo PvP de Reinos',
        description: 'Competición eliminatoria entre los 8 Reinos más poderosos del servidor.',
        type: 'dice',
        status: 'active',
        image_url: '/images/events/pvp-arena.webp',
        registrations: [
          { id: 1, created_at: '2026-08-01', profiles: { username: 'KilluBysmali', avatar_url: 'https://mc-heads.net/avatar/KilluBysmali/64' } },
          { id: 2, created_at: '2026-08-01', profiles: { username: 'Gamer42', avatar_url: 'https://mc-heads.net/avatar/Steve/64' } },
        ],
      },
      {
        id: 2,
        title: 'Concurso de Construcción Abisal',
        description: 'Construye la mejor estructura temática de cristal en 2 horas.',
        type: 'hammer',
        status: 'soon',
      },
      {
        id: 3,
        title: 'Carrera del Nether',
        description: 'Cruza el Nether de punta a punta sin morir.',
        type: 'running',
        status: 'finished',
      },
    ],
  },
};

export const EmptyEventsBoard: Story = {
  args: {
    loading: false,
    onEdit: () => {},
    onDelete: () => {},
    onViewRegistrations: () => {},
    onNew: () => {},
    events: [],
  },
};
