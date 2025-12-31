import type { Meta, StoryObj } from '@storybook/react-vite';
import { StaffCard } from '../../components/Admin/StaffCard';
import '../../styles/admin_staff.css'; // Import styles for StaffCard

const meta = {
  title: 'Admin/StaffCard',
  component: StaffCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0b0c10' },
        ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StaffCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Data
const mockNeroferno = {
    id: 1,
    name: 'Neroferno',
    role: 'Neroferno',
    description: 'Creador y Owner de CrystalTides.',
    image: 'Neroferno',
    color: '#8b5cf6',
    socials: { twitter: 'neroferno', discord: 'neroferno', youtube: '', twitch: 'neroferno' }
};

const mockKillu = {
    id: 2,
    name: 'Killuwu',
    role: 'Killuwu',
    description: 'Administradora y Co-Owner.',
    image: 'Killuwu',
    color: '#0ea5e9',
    socials: { twitter: '', discord: 'killuwu', youtube: '', twitch: '' }
};

const mockUser = {
    id: 3,
    name: 'Steve',
    role: 'Usuario',
    description: 'Un usuario normal del servidor.',
    image: 'Steve',
    color: '#db7700',
    socials: { twitter: '', discord: '', youtube: '', twitch: '' }
};

export const Default: Story = {
  args: {
    data: mockUser,
    status: { mc: 'offline', discord: 'offline' },
    roleBadge: null,
  },
};

export const AdminOnline: Story = {
  args: {
    data: mockNeroferno,
    status: { mc: 'online', discord: 'online' },
    roleBadge: '/ranks/rank-neroferno.png',
  },
};

export const DiscordOnly: Story = {
  args: {
    data: mockKillu,
    status: { mc: 'offline', discord: 'dnd' },
    roleBadge: '/ranks/rank-killu.png',
  },
};

export const NoRoleBadge: Story = {
    args: {
        data: { ...mockUser, role: 'Staff', color: '#89c606' },
        status: { mc: 'online', discord: 'idle' },
        roleBadge: null,
    }
}
