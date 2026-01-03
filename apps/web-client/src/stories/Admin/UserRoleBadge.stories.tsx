import type { Meta, StoryObj } from '@storybook/react';
import { UserRoleBadge } from '../../components/Admin/Users/UserRoleBadge';

const meta: Meta<typeof UserRoleBadge> = {
  title: 'Admin/Users/UserRoleBadge',
  component: UserRoleBadge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserRoleBadge>;

export const Default: Story = {
  args: {
    role: 'user',
  },
};

export const Admin: Story = {
    args: {
      role: 'admin',
    },
};

export const Staff: Story = {
    args: {
      role: 'staff',
    },
};

export const Custom: Story = {
    args: {
      role: 'founder',
    },
};
