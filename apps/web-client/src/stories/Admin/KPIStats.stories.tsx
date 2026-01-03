import type { Meta, StoryObj } from '@storybook/react';
import KPIStats from '../../components/Admin/Dashboard/KPIStats';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof KPIStats> = {
  title: 'Admin/Dashboard/KPIStats',
  component: KPIStats,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', padding: '2rem' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KPIStats>;

export const Default: Story = {
  args: {
    serverStats: {
        online: true,
        status: 'running',
        players: { online: 50, max: 200 }
    },
    ticketStats: { open: 12, urgent: 3 },
    donationStats: { currentMonth: "1250.00", percentChange: 15 }
  },
};

export const Offline: Story = {
    args: {
      serverStats: {
          online: false,
          status: 'offline',
          players: { online: 0, max: 200 }
      },
      ticketStats: { open: 0, urgent: 0 },
      donationStats: { currentMonth: "0.00", percentChange: 0 }
    },
};
