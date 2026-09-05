import type { Meta, StoryObj } from '@storybook/react';
import UserRoleModal from '../../../components/Admin/Users/UserRoleModal';
import { UserDefinition } from '../../../components/Admin/Users/types';

const mockUser: UserDefinition = {
  id: 'usr-nero-01',
  email: 'neroferno@crystaltidessmp.net',
  username: 'NeroFerno',
  role: 'admin',
  avatar_url: 'https://mc-heads.net/avatar/NeroFerno/100',
  created_at: '2026-01-15T00:00:00Z'
};

const meta: Meta<typeof UserRoleModal> = {
  title: 'Admin/Users/UserRoleModal',
  component: UserRoleModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserRoleModal>;

export const PromoteToOwner: Story = {
  args: {
    user: mockUser,
    newRole: 'neroferno',
    onClose: () => console.log('Close modal'),
    onConfirm: () => console.log('Role updated to neroferno')
  }
};

export const PromoteToStaff: Story = {
  args: {
    user: {
      ...mockUser,
      username: 'SteveGamer',
      email: 'steve@crystaltides.net',
      role: 'user'
    },
    newRole: 'staff',
    onClose: () => console.log('Close modal'),
    onConfirm: () => console.log('Role updated to staff')
  }
};
