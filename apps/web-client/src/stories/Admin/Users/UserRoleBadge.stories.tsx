import type { Meta, StoryObj } from '@storybook/react';
import { UserRoleBadge } from '../../../components/Admin/Users/UserRoleBadge';

const meta: Meta<typeof UserRoleBadge> = {
  title: 'Admin/Users/UserRoleBadge',
  component: UserRoleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserRoleBadge>;

export const Neroferno: Story = {
  args: {
    role: 'neroferno'
  }
};

export const Killu: Story = {
  args: {
    role: 'killu'
  }
};

export const Founder: Story = {
  args: {
    role: 'founder'
  }
};

export const Admin: Story = {
  args: {
    role: 'admin'
  }
};

export const Staff: Story = {
  args: {
    role: 'staff'
  }
};

export const Helper: Story = {
  args: {
    role: 'helper'
  }
};

export const Donor: Story = {
  args: {
    role: 'donor'
  }
};

export const RegularUser: Story = {
  args: {
    role: 'user'
  }
};
