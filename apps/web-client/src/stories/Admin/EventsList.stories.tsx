import type { Meta, StoryObj } from '@storybook/react-vite';
import EventsList from '../../components/Admin/Events/EventsList';

const meta: Meta<typeof EventsList> = {
  title: 'Admin/Events/EventsList',
  component: EventsList,
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
type Story = StoryObj<typeof EventsList>;

const MOCK_EVENTS = [
    { id: 1, title: 'Master Builder: Navidad', description: 'Construye la mejor villa navideña.', type: 'building', status: 'active', created_at: new Date().toISOString(), registrations: [1, 2, 3] },
    { id: 2, title: 'Torneo PvP 1v1', description: 'Combate por la gloria y premios únicos.', type: 'pvp', status: 'soon', created_at: new Date().toISOString(), registrations: [] },
    { id: 3, title: 'Búsqueda del Tesoro', description: 'Encuentra los cofres ocultos de Killu.', type: 'scavenger', status: 'finished', created_at: new Date().toISOString(), registrations: [1, 2, 3, 4, 5] },
];

export const Default: Story = {
    args: {
        events: MOCK_EVENTS,
        loading: false,
        onEdit: (e) => console.log('Edit', e),
        onDelete: (id) => console.log('Delete', id),
        onViewRegistrations: (id) => console.log('ViewRegistrations', id),
        onNew: () => console.log('New Event'),
    }
};

export const Empty: Story = {
    args: {
        events: [],
        loading: false,
        onEdit: () => {},
        onDelete: () => {},
        onViewRegistrations: () => {},
        onNew: () => console.log('New Event'),
    }
};

export const Loading: Story = {
    args: {
        events: [],
        loading: true,
        onEdit: () => {},
        onDelete: () => {},
        onViewRegistrations: () => {},
        onNew: () => {},
    }
};
