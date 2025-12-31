import type { Meta, StoryObj } from '@storybook/react-vite';
import Navbar from '../../components/Layout/Navbar';
import { AuthContext } from '../../context/AuthContext';
import { User, Provider } from '@supabase/supabase-js';
import React from 'react';

// Simplified Mock Auth Provider
const MockAuthProvider = ({ children, user }: { children: React.ReactNode, user: User | null }) => {
    const mockValue = {
        user: user,
        login: async () => ({ user: user, session: null }),
        loginWithProvider: async () => ({ provider: 'discord' as Provider, url: '' }),
        logout: async () => {},
        register: async () => ({ user: user, session: null }),
        updateUser: async () => undefined,
        loading: false
    };

    return (
        <AuthContext.Provider value={mockValue}>
            {children}
        </AuthContext.Provider>
    );
};

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => <Story />,
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Guest State
export const Guest: Story = {
    decorators: [
        (Story) => <MockAuthProvider user={null}><Story /></MockAuthProvider>
    ]
};

// Logged In State
const mockUser = {
    id: '123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'user@example.com',
    app_metadata: {},
    user_metadata: {
        username: 'Steve',
        avatar_url: 'https://minotar.net/avatar/Steve/64'
    },
    created_at: new Date().toISOString()
} as User;

export const LoggedIn: Story = {
    decorators: [
         (Story) => <MockAuthProvider user={mockUser}><Story /></MockAuthProvider>
    ]
};
