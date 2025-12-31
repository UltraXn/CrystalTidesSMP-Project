import type { Meta, StoryObj } from '@storybook/react-vite';
import Tutorial from '../../components/UI/Tutorial';
import { AuthContext } from '../../context/AuthContext';
import { User, Provider } from '@supabase/supabase-js';
import React from 'react';

// Reusing MockAuthProvider pattern
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
  title: 'Support/Tutorial',
  component: Tutorial,
  parameters: {
    layout: 'fullscreen',
    docs: {
        description: {
            component: 'Onboarding tutorial modal. Automatically appears for guest users after a delay.'
        }
    }
  },
  decorators: [
    (Story) => (
        <Story />
    ),
  ]
} satisfies Meta<typeof Tutorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GuestFlow: Story = {
    decorators: [
        (Story) => (
            <MockAuthProvider user={null}>
                <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
                    <h3>Tutorial Trigger</h3>
                    <p>The tutorial should appear automatically after 1.5 seconds.</p>
                    <Story />
                </div>
            </MockAuthProvider>
        )
    ]
};
