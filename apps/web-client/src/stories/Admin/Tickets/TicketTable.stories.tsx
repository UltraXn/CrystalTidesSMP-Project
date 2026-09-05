import type { Meta, StoryObj } from '@storybook/react';
import TicketTable from '../../../components/Admin/Tickets/TicketTable';

const meta: Meta<typeof TicketTable> = {
  title: 'AdminTickets/TicketTable',
  component: TicketTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TicketTable>;

export const TicketsWithData: Story = {
  args: {
    loading: false,
    selectedTicketIds: [],
    toggleSelectAll: () => {},
    toggleSelectTicket: () => {},
    onViewTicket: () => {},
    tickets: [
      {
        id: 1,
        user_id: 'usr-100',
        subject: 'No puedo entrar al servidor tras actualización',
        description: 'Después de la actualización a v2.4.0 me sale error de handshake.',
        priority: 'urgent',
        status: 'open',
        created_at: '2026-08-09T10:30:00Z',
        profiles: { username: 'KilluBysmali', avatar_url: 'https://mc-heads.net/avatar/KilluBysmali/64' },
      },
      {
        id: 2,
        user_id: 'usr-101',
        subject: 'Cristales de Maestría no se acreditaron',
        description: 'Compré 500 cristales y no aparecen en mi inventario.',
        priority: 'high',
        status: 'pending',
        created_at: '2026-08-08T14:20:00Z',
        profiles: { username: 'Gamer42', avatar_url: 'https://mc-heads.net/avatar/Steve/64' },
      },
      {
        id: 3,
        user_id: 'usr-102',
        subject: 'Sugerencia: Nuevo bioma para la próxima temporada',
        description: 'Me gustaría un bioma de cavernas de cristal.',
        priority: 'low',
        status: 'resolved',
        created_at: '2026-08-05T09:00:00Z',
        profiles: { username: 'BuilderPro', avatar_url: 'https://mc-heads.net/avatar/Alex/64' },
      },
    ],
  },
};

export const LoadingTickets: Story = {
  args: {
    loading: true,
    selectedTicketIds: [],
    toggleSelectAll: () => {},
    toggleSelectTicket: () => {},
    onViewTicket: () => {},
    tickets: [],
  },
};
