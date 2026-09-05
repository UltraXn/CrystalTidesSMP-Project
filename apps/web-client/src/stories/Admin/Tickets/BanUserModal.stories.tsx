import type { Meta, StoryObj } from '@storybook/react';
import BanUserModal from '../../../components/Admin/Tickets/BanUserModal';
import { Ticket } from '../../../components/Admin/Tickets/types';

const mockTicketForBan: Ticket = {
  id: 1055,
  user_id: 'usr-bad-actor',
  subject: 'Reporte: Uso de X-Ray y fly en la dimensión Netherite',
  description: 'Jugador sospechoso minando directamente a las cámaras de prueba y minerales ancestrales.',
  status: 'open',
  priority: 'urgent',
  created_at: new Date().toISOString(),
  profiles: {
    username: 'GrieferPlayer_99',
    avatar_url: 'https://mc-heads.net/avatar/Herobrine/100'
  }
};

const meta: Meta<typeof BanUserModal> = {
  title: 'Admin/Tickets/BanUserModal',
  component: BanUserModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BanUserModal>;

export const Default: Story = {
  args: {
    ticket: mockTicketForBan,
    onClose: () => console.log('Close Ban modal'),
    onSuccess: () => console.log('Ban executed successfully')
  }
};
