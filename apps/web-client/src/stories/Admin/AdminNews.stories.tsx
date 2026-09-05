import type { Meta, StoryObj } from '@storybook/react';
import AdminNews from '../../components/Admin/AdminNews';
import { User } from '@supabase/supabase-js';

const mockAdminUser: User = {
  id: 'usr-admin-nero',
  app_metadata: { role: 'admin' },
  user_metadata: { username: 'NeroFerno' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@crystaltides.net',
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString()
};

const meta: Meta<typeof AdminNews> = {
  title: 'Admin/News/AdminNews',
  component: AdminNews,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminNews>;

export const AuthenticatedAdminNewsManager: Story = {
  args: {
    user: mockAdminUser
  }
};
