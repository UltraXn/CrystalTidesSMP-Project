import type { Meta, StoryObj } from '@storybook/react';
import EventsManager from '../../components/Admin/EventsManager';
import { Event, Registration } from '../../components/Admin/Events/types';

const meta = {
  title: 'Admin/EventsManager',
  component: EventsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventsManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Data
const mockRegistrations: Registration[] = [
    {
        id: 1,
        created_at: new Date().toISOString(),
        profiles: {
            username: 'PlayerOne',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PlayerOne'
        }
    },
    {
        id: 2,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: {
            username: 'GamerGirl',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerGirl'
        }
    }
];

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Torneo PvP Semanal',
    title_en: 'Weekly PvP Tournament',
    description: 'Únete al torneo y gana premios increíbles.',
    description_en: 'Join the tournament and win amazing prizes.',
    type: 'hammer',
    status: 'active',
    registrations: mockRegistrations
  },
  {
    id: 2,
    title: 'Evento de Parkour',
    title_en: 'Parkour Event',
    description: 'Demuestra tus habilidades de salto.',
    description_en: 'Show off your jumping skills.',
    type: 'running',
    status: 'soon',
    registrations: []
  },
  {
    id: 3,
    title: 'Búsqueda del Tesoro',
    title_en: 'Treasure Hunt',
    description: 'Encuentra el cofre escondido en el spawn.',
    description_en: 'Find the hidden chest at spawn.',
    type: 'map',
    status: 'finished',
    registrations: [mockRegistrations[0]]
  }
];

export const Default: Story = {
  args: {
    mockEvents: mockEvents,
    mockRegistrationsMap: {
        1: mockRegistrations,
        3: [mockRegistrations[0]]
    }
  },
};

export const Empty: Story = {
  args: {
    mockEvents: [],
  },
};

export const Loading: Story = {
  args: {
      // Intentionally empty to trigger internal loading state if logic permits, 
      // but component logic sets loading=true if !mockEvents. 
      // However, if we pass nothing, it assumes undefined which triggers fetch but we can't easily mock fetch here without msw/api mocking.
      // So effectively this will show loading spinner until fetch fails or we mock it.
  },
  render: () => <EventsManager /> 
};
