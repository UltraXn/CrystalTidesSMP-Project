import type { Preview } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/AuthContext';
import '../src/styles/main.css';
import '../src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0b0c10' },
        { name: 'abyssal', value: '#0c5952' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <div style={{ minHeight: '100vh', background: '#0b0c10', color: '#fff', padding: '1rem' }}>
              <Story />
            </div>
            {/* Modal Portal Root */}
            <div id="modal-root" />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
