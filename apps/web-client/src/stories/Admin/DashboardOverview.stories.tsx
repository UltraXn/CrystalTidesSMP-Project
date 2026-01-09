import type { Meta, StoryObj } from '@storybook/react-vite';
import DashboardOverview from '../../components/Admin/DashboardOverview';

const meta: Meta<typeof DashboardOverview> = {
  title: 'Admin/DashboardOverview',
  component: DashboardOverview,
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
type Story = StoryObj<typeof DashboardOverview>;

const MOCK_SERVER = {
    online: true,
    status: 'running',
    memory: { current: 8192, limit: 16384 },
    cpu: 45,
    players: { online: 120, max: 200 },
    global: { total: 5432, new: 12, playtime: 99999 }
};

const MOCK_STAFF = [
    { username: 'AdminUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Neroferno', mc_status: 'online', discord_status: 'dnd', login_time: Date.now() - 3600000 },
    { username: 'ModHelper', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mod', role: 'Moderator', mc_status: 'offline', discord_status: 'online', login_time: null },
    { username: 'DevGuru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', role: 'Developer', mc_status: 'online', discord_status: 'online', login_time: Date.now() - 7200000 },
    { username: 'HelperNew', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Help', role: 'Helper', mc_status: 'offline', discord_status: 'idle', login_time: null }
] as any[];

export const Default: Story = {
    args: {
        mockServerStats: MOCK_SERVER,
        mockStaffOnline: MOCK_STAFF,
        mockTicketStats: { open: 5, urgent: 2 },
        mockDonationStats: { currentMonth: "1250.50", percentChange: 15 }
    }
};

export const Offline: Story = {
    args: {
        mockServerStats: { ...MOCK_SERVER, online: false, status: 'offline', cpu: 0, memory: { current: 0, limit: 16384 }, players: { online: 0, max: 200 } },
        mockStaffOnline: [],
        mockTicketStats: { open: 0, urgent: 0 },
        mockDonationStats: { currentMonth: "0.00", percentChange: -5 }
    }
};

export const Loading: Story = {
    // Falls back to loading state since no mocks provided
};
