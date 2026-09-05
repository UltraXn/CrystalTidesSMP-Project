import type { Meta, StoryObj } from '@storybook/react';
import TicketDetailModal from '../../../components/Admin/Tickets/TicketDetailModal';
import { Ticket, Message } from '../../../components/Admin/Tickets/types';

const mockTicket: Ticket = {
  id: 1042,
  user_id: 'usr-9921-steve',
  subject: 'Perdí mis objetos en la Mazmorra del Vacío por desconexión del servidor',
  description: 'Estaba en la sala del jefe Ignis y hubo un reinicio abrupto. Al reconectar aparecí muerto en el spawn y no había tumba.',
  status: 'open',
  priority: 'high',
  created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  profiles: {
    username: 'SteveGamer_MC',
    avatar_url: 'https://mc-heads.net/avatar/Steve/100'
  }
};

const mockMessages: Message[] = [
  {
    id: 1,
    user_id: 'usr-9921-steve',
    message: 'Hola equipo de Staff, estaba enfrentando a Ignis cuando el servidor tuvo un timeout. ¿Podrían revisar los logs de muertes?',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    is_staff: false
  },
  {
    id: 2,
    user_id: 'usr-staff-01',
    message: 'Hola Steve. Hemos revisado la telemetría del BossTelemetryModule a las 14:32 UTC. Confirmamos que la muerte fue por desync de red durante el cambio de fase.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_staff: true
  },
  {
    id: 3,
    user_id: 'usr-staff-01',
    message: 'Se ha restaurado tu inventario en el cofre del spawn y se han otorgado 500 Killucoins de compensación.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    is_staff: true
  }
];

const meta: Meta<typeof TicketDetailModal> = {
  title: 'Admin/Tickets/TicketDetailModal',
  component: TicketDetailModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TicketDetailModal>;

export const ActiveConversation: Story = {
  args: {
    ticket: mockTicket,
    onClose: () => console.log('Close modal'),
    refreshTickets: () => console.log('Refresh tickets list'),
    mockMessages: mockMessages,
    user: { id: 'usr-staff-01' }
  }
};

export const UrgentBugReport: Story = {
  args: {
    ticket: {
      ...mockTicket,
      id: 1088,
      subject: 'CRÍTICO: Duplicación de Killucoins en la Bolsa del Mercado',
      priority: 'urgent',
      status: 'pending',
    },
    onClose: () => console.log('Close modal'),
    refreshTickets: () => console.log('Refresh tickets list'),
    mockMessages: [
      {
        id: 10,
        user_id: 'usr-nero',
        message: 'Reporto que al vender lingotes de Netherite en múltiplos de 64 se produce un desajuste de decimales.',
        created_at: new Date().toISOString(),
        is_staff: false
      }
    ],
    user: { id: 'usr-staff-01' }
  }
};

export const ClosedResolved: Story = {
  args: {
    ticket: {
      ...mockTicket,
      id: 994,
      status: 'closed',
      subject: 'Problema con la activación del paquete VIP en la tienda',
    },
    onClose: () => console.log('Close modal'),
    refreshTickets: () => console.log('Refresh tickets list'),
    mockMessages: [
      mockMessages[0],
      {
        id: 20,
        user_id: 'usr-staff-01',
        message: 'Rol sincronizado exitosamente con Discord y el servidor de Minecraft. Ticket cerrado.',
        created_at: new Date().toISOString(),
        is_staff: true
      }
    ],
    user: { id: 'usr-staff-01' }
  }
};
