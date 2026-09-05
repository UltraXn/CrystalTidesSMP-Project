import type { Meta, StoryObj } from '@storybook/react';
import UsersTable from '../../../components/Admin/Users/UsersTable';

const meta: Meta<typeof UsersTable> = {
  title: 'AdminUsers/UsersTable',
  component: UsersTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UsersTable>;

export const UsersWithData: Story = {
  args: {
    loading: false,
    hasSearched: true,
    canManageRoles: true,
    onEditMedals: () => {},
    onEditAchievements: () => {},
    onRoleChange: () => {},
    users: [
      {
        id: 'usr-100',
        email: 'killu@crystaltides.com',
        username: 'KilluBysmali',
        role: 'staff',
        medals: [1, 2, 3],
        achievements: ['builder_master', 'pvp_champion'],
        created_at: '2026-01-12T10:00:00Z',
        avatar_url: 'https://mc-heads.net/avatar/KilluBysmali/64',
      },
      {
        id: 'usr-101',
        email: 'gamer42@example.com',
        username: 'Gamer42',
        role: 'user',
        medals: [],
        achievements: [],
        created_at: '2026-05-20T15:30:00Z',
        avatar_url: 'https://mc-heads.net/avatar/Steve/64',
      },
      {
        id: 'usr-102',
        email: 'ultraxn@crystaltides.com',
        username: 'UltraXn',
        role: 'admin',
        medals: [1, 2, 3, 4, 5],
        achievements: ['builder_master', 'pvp_champion', 'explorer_king'],
        created_at: '2025-11-01T08:00:00Z',
        avatar_url: 'https://mc-heads.net/avatar/UltraXn/64',
      },
    ],
  },
};

export const LoadingUsersTable: Story = {
  args: {
    loading: true,
    hasSearched: false,
    canManageRoles: false,
    onEditMedals: () => {},
    onEditAchievements: () => {},
    onRoleChange: () => {},
    users: [],
  },
};
