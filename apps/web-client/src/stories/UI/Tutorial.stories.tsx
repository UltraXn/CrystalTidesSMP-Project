// eslint-disable-next-line
import type { Meta, StoryObj } from '@storybook/react';
import Tutorial from '../../components/UI/Tutorial';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  title: 'UI/Tutorial',
  component: Tutorial,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Tutorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GuestState: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{ 
        user: null, 
        loading: false, 
        login: async () => ({ user: null, session: null }),
        logout: async () => {},
        register: async () => ({ user: null, session: null }),
        loginWithProvider: async () => ({ provider: 'discord', url: '' }),
        updateUser: async () => ({} as any)
      }}>
        <div style={{ minHeight: '400px', background: '#0b0c10' }}>
            <p style={{ color: '#444', textAlign: 'center', paddingTop: '100px' }}>
                The tutorial should appear automatically for guest users.
            </p>
            <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
};

export const LoggedInState: Story = {
    decorators: [
      (Story) => (
        <AuthContext.Provider value={{ 
          user: { id: '1', email: 'test@example.com', user_metadata: { role: 'member' } } as any, 
          loading: false, 
          login: async () => ({ user: null, session: null }),
          logout: async () => {},
          register: async () => ({ user: null, session: null }),
          loginWithProvider: async () => ({ provider: 'discord', url: '' }),
          updateUser: async () => ({} as any)
        }}>
          <div style={{ minHeight: '200px', background: '#0b0c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#fff' }}>
                  The tutorial is HIDDEN for logged-in users.
              </p>
              <Story />
          </div>
        </AuthContext.Provider>
      ),
    ],
  };
