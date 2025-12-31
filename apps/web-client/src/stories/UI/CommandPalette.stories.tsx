import type { Meta, StoryObj } from '@storybook/react-vite';
import CommandPalette from '../../components/UI/CommandPalette';
import { AuthContext } from '../../context/AuthContext';
import { useEffect } from 'react';
import { User, Provider } from '@supabase/supabase-js';
import React from 'react';

// Mock Provider for Admin/User states
const MockAuthProvider = ({ children, role }: { children: React.ReactNode, role?: string }) => {
    const mockUser = role ? {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mock@test.com',
        app_metadata: {},
        user_metadata: { role },
        created_at: new Date().toISOString(),
    } as User : null;

    const mockValue = {
        user: mockUser,
        login: async () => ({ user: mockUser, session: null }),
        loginWithProvider: async () => ({ provider: 'discord' as Provider, url: '' }),
        logout: async () => {},
        register: async () => ({ user: mockUser, session: null }),
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
  title: 'UI/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
        description: {
            component: 'Global command palette triggered by Ctrl+K. Requires AuthContext and Router.'
        }
    }
  },
  decorators: [
    (Story) => (
        <Story />
    ),
  ]
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to open it automatically
const OpenWrapper = () => {
    useEffect(() => {
        // Simulate Ctrl+K after mount
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            metaKey: true,
            bubbles: true
        });
        window.dispatchEvent(event);
    }, []);

    return (
        <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            <h3>Press <b>Cmd+K</b> or <b>Ctrl+K</b> to open</h3>
            <p>Or wait for auto-trigger...</p>
            <CommandPalette />
        </div>
    );
};

export const Guest: Story = {
    decorators: [
        (Story) => <MockAuthProvider><Story /></MockAuthProvider>
    ],
    render: () => <OpenWrapper />
};

export const AdminState: Story = {
    decorators: [
        (Story) => <MockAuthProvider role="admin"><Story /></MockAuthProvider>
    ],
    render: () => <OpenWrapper />
};

export const UserState: Story = {
    decorators: [
        (Story) => <MockAuthProvider role="user"><Story /></MockAuthProvider>
    ],
    render: () => <OpenWrapper />
};
