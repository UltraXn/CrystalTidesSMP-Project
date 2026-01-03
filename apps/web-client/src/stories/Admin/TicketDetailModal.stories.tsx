import type { Meta, StoryObj } from '@storybook/react';
import TicketDetailModal from '../../components/Admin/Tickets/TicketDetailModal';
import { Ticket } from '../../components/Admin/Tickets/types';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof TicketDetailModal> = {
  title: 'Admin/Tickets/TicketDetailModal',
  component: TicketDetailModal,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div style={{height: '100vh', width: '100vw', background: '#000'}}>
             <Story />
        </div>
      </I18nextProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketDetailModal>;

const mockTicket: Ticket = {
    id: 101,
    user_id: 'u-1',
    subject: 'Problema con el Rango VIP',
    description: 'Hola, compré el rango VIP ayer y aún no recibo mis 500 gemas diarias. ¿Podrían revisar? Adjunto comprobante (imaginario).',
    priority: 'high',
    status: 'open',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'CoolGamer123',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CoolGamer123'
    }
};

const mockMessages = [
    { id: 1, user_id: 'u-1', message: '¿Alguien me puede ayudar?', is_staff: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, user_id: 'admin-1', message: 'Hola CoolGamer123, estamos revisando tu caso. Dame un momento.', is_staff: true, created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 3, user_id: 'u-1', message: 'Gracias, quedo a la espera.', is_staff: false, created_at: new Date(Date.now() - 900000).toISOString() }
];

export const Default: Story = {
  args: {
    ticket: mockTicket,
    onClose: () => console.log('Close Modal'),
    refreshTickets: () => console.log('Refresh Tickets'),
    mockMessages: mockMessages,
    user: { id: 'admin-id' }
  },
};

export const ClosedTicket: Story = {
    args: {
      ticket: { ...mockTicket, status: 'closed' },
      onClose: () => console.log('Close Modal'),
      refreshTickets: () => console.log('Refresh Tickets'),
      mockMessages: mockMessages,
      user: { id: 'admin-id' }
    },
  };
