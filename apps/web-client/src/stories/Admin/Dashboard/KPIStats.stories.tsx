import type { Meta, StoryObj } from '@storybook/react';
import KPIStats from '../../../components/Admin/Dashboard/KPIStats';

const meta: Meta<typeof KPIStats> = {
  title: 'AdminDashboard/KPIStats',
  component: KPIStats,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KPIStats>;

export const ServerOnlineHealthy: Story = {
  args: {
    serverStats: {
      online: true,
      status: 'online',
      players: { online: 142, max: 200 },
    },
    ticketStats: { open: 5, urgent: 2 },
    donationStats: { currentMonth: '1,245.00', percentChange: 12.5 },
  },
};

export const ServerOfflineMaintenance: Story = {
  args: {
    serverStats: {
      online: false,
      status: 'maintenance',
      players: { online: 0, max: 200 },
    },
    ticketStats: { open: 18, urgent: 8 },
    donationStats: { currentMonth: '890.50', percentChange: -5.2 },
  },
};
