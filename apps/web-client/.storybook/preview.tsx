import type { Preview } from "@storybook/react";
import '../src/index.css'; // Import ALL global styles including variables, base, layout, etc.
import { BrowserRouter } from 'react-router-dom';
import React, { Suspense } from 'react';
import '../src/i18n'; // Initialize i18next
import { AuthContext } from '../src/context/AuthContext';
import type { User } from '@supabase/supabase-js';

// Mock User for Storybook
const mockUser = {
  id: 'mock-user-id',
  email: 'admin@crystaltides.com',
  user_metadata: {
    role: 'neroferno', // Default to highest privilege for visibility
    avatar_url: 'https://github.com/shadcn.png'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
} as unknown as User;

const mockAuthContext = {
  user: mockUser,
  login: async () => ({ user: mockUser, session: null }),
  loginWithProvider: async () => ({ provider: 'discord' as const, url: 'http://mock-url.com' }),
  logout: async () => {},
  register: async () => ({ user: mockUser, session: null }),
  updateUser: async () => mockUser,
  loading: false
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'void',
      values: [
        { name: 'void', value: '#0B0C10' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuthContext}>
        <Suspense fallback={<div className="p-10 text-white">Loading translations...</div>}>
          <BrowserRouter>
            <div className="bg-[#0B0C10] min-h-screen text-white font-inter">
                <Story />
            </div>
          </BrowserRouter>
        </Suspense>
      </AuthContext.Provider>
    ),
  ],
};

export default preview;
