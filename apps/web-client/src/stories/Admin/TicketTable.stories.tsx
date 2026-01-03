import type { Meta, StoryObj } from '@storybook/react';
import TicketTable from '../../components/Admin/Tickets/TicketTable';
import { Ticket } from '../../components/Admin/Tickets/types';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof TicketTable> = {
  title: 'Admin/Tickets/TicketTable',
  component: TicketTable,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="text-white p-4 bg-gray-900 min-h-screen">
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketTable>;

const mockTickets: Ticket[] = [
  {
    id: 101,
    user_id: 'u-1',
    subject: 'Problema con el Rango VIP',
    description: 'No he recibido mis gemas diarias.',
    priority: 'high',
    status: 'open',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'CoolGamer123',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CoolGamer123'
    }
  },
  {
    id: 102,
    user_id: 'u-2',
    subject: 'Reporte de Bug en Gacha',
    description: 'La animación se traba al girar.',
    priority: 'medium',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: {
      username: 'BugHunter99',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BugHunter99'
    }
  },
  {
    id: 103,
    user_id: 'u-3',
    subject: 'Solicitud de Desbaneo',
    description: 'Fue un error, lo siento.',
    priority: 'urgent',
    status: 'closed',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: {
      username: 'BannedUser',
      avatar_url: ''
    }
  }
];

export const Default: Story = {
  args: {
    tickets: mockTickets,
    loading: false,
    selectedTicketIds: [],
    toggleSelectAll: () => console.log('Toggle All'),
    toggleSelectTicket: (id) => console.log('Toggle Ticket', id),
    onViewTicket: (ticket) => console.log('View Ticket', ticket),
  },
};

export const Loading: Story = {
  args: {
    tickets: [],
    loading: true,
    selectedTicketIds: [],
  },
};

export const Empty: Story = {
  args: {
    tickets: [],
    loading: false,
    selectedTicketIds: [],
  },
};

export const WithSelection: Story = {
    args: {
      tickets: mockTickets,
      loading: false,
      selectedTicketIds: [101, 103],
      toggleSelectAll: () => console.log('Toggle All'),
      toggleSelectTicket: (id) => console.log('Toggle Ticket', id),
      onViewTicket: (ticket) => console.log('View Ticket', ticket),
    },
  };
