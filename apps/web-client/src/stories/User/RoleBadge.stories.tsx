import type { Meta, StoryObj } from '@storybook/react';
import RoleBadge from '../../components/User/RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'User/RoleBadge',
  component: RoleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const StaffBadge: Story = {
  args: {
    role: 'staff',
  },
};

export const AdminBadge: Story = {
  args: {
    role: 'admin',
  },
};

export const DeveloperBadge: Story = {
  args: {
    role: 'developer',
  },
};

export const DonadorBadge: Story = {
  args: {
    role: 'donador',
  },
};
