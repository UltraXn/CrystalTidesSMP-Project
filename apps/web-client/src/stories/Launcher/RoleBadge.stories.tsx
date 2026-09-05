import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from '../../components/Launcher/RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Launcher/RoleBadge',
  component: RoleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const NerofernoRole: Story = {
  args: {
    role: 'neroferno',
    size: 'lg',
  }
};

export const KilluRole: Story = {
  args: {
    role: 'killu',
    size: 'lg',
  }
};

export const AdminRole: Story = {
  args: {
    role: 'admin',
    size: 'md',
  }
};

export const DeveloperRole: Story = {
  args: {
    role: 'developer',
    size: 'md',
  }
};

export const DonadorRole: Story = {
  args: {
    role: 'donador',
    size: 'md',
  }
};

export const UserRole: Story = {
  args: {
    role: 'user',
    size: 'sm',
  }
};
