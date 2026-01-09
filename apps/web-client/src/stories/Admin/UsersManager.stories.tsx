import type { Meta, StoryObj } from '@storybook/react-vite';
import UsersManager from '../../components/Admin/UsersManager';

const meta: Meta<typeof UsersManager> = {
  title: 'Admin/UsersManager',
  component: UsersManager,
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
type Story = StoryObj<typeof UsersManager>;

const MOCK_USERS = [
    { id: 'u1', email: 'admin@crystal.com', username: 'SuperAdmin', role: 'neroferno', medals: [1, 2], created_at: new Date().toISOString() },
    { id: 'u2', email: 'mod@crystal.com', username: 'ModeratorOne', role: 'moderator', medals: [], created_at: new Date().toISOString() },
    { id: 'u3', email: 'gamer@crystal.com', username: 'ProGamer123', role: 'user', medals: [3], created_at: new Date().toISOString() },
    { id: 'u4', email: 'new@crystal.com', username: 'Newbie', role: 'user', medals: [], created_at: new Date().toISOString() }
] as any[];

const MOCK_MEDALS = [
    { id: 1, name: 'Fundador', color: '#fbbf24', icon: '👑', description: 'Early supporter' },
    { id: 2, name: 'Bug Hunter', color: '#f87171', icon: '🐛', description: 'Found a bug' },
    { id: 3, name: 'VIP', color: '#c084fc', icon: '💎', description: 'Donated' }
] as any[];

export const Default: Story = {
    args: {
        mockUsers: MOCK_USERS,
        mockMedals: MOCK_MEDALS
    }
};

export const Empty: Story = {
    args: {
        mockUsers: [],
        mockMedals: MOCK_MEDALS
    }
};

export const Loading: Story = {
    // Falls back to local loading state if no mocks provided, but since we modify state initialization,
    // to simulate "loading" we might need to actually NOT pass mocks and let it try to fetch (which will stay loading or fail).
    // However, purely for visual comparison, we can't easily force "loading=true" via props unless we added a mockLoading prop.
    // For now, "Empty" is a good enough alternative state.
};
