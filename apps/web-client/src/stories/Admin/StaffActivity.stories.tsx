import type { Meta, StoryObj } from '@storybook/react';
import StaffActivity from '../../components/Admin/Dashboard/StaffActivity';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof StaffActivity> = {
  title: 'Admin/Dashboard/StaffActivity',
  component: StaffActivity,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', padding: '2rem', maxWidth: '600px' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StaffActivity>;

const mockStaff = [
    {
        username: 'Neroferno',
        role: 'Founder',
        avatar: 'Neroferno',
        mc_status: 'online',
        discord_status: 'online',
        login_time: Date.now() - 3600000 
    },
    {
        username: 'Killuwu',
        role: 'Admin',
        avatar: 'Killuwu',
        mc_status: 'offline',
        discord_status: 'online',
        login_time: null
    }
];

export const Default: Story = {
  args: {
    staffOnline: mockStaff,
    serverOnline: true
  },
};

export const Empty: Story = {
    args: {
      staffOnline: [],
      serverOnline: true
    },
};

export const ServerOffline: Story = {
    args: {
      staffOnline: [],
      serverOnline: false
    },
};
