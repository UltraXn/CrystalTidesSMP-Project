import type { Meta, StoryObj } from '@storybook/react';
import StaffCard from '../../components/Admin/StaffCard';

const meta: Meta<typeof StaffCard> = {
  title: 'Admin/StaffCard',
  component: StaffCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffCard>;

export const OnlineStaffMember: Story = {
  args: {
    data: {
      id: 1,
      name: 'UltraXn',
      mc_nickname: 'UltraXn',
      role: 'Fundador & Desarrollador',
      description: 'Creador y administrador principal de CrystalTides SMP.',
      image: 'https://mc-heads.net/avatar/UltraXn/128',
      color: '#00E5A0',
      socials: { discord: 'ultraxn', youtube: 'ultraxn' },
    },
    status: { mc: 'online', discord: 'online' },
    roleBadge: '👑 Fundador',
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const OfflineStaffMember: Story = {
  args: {
    data: {
      id: 2,
      name: 'KilluBysmali',
      mc_nickname: 'KilluBysmali',
      role: 'Moderador',
      description: 'Encargado de la moderación y soporte en el servidor.',
      image: 'https://mc-heads.net/avatar/KilluBysmali/128',
      color: '#38BDF8',
      socials: { discord: 'killubysmali' },
    },
    status: { mc: 'offline', discord: 'idle' },
    roleBadge: '🛡️ Moderador',
  },
};
