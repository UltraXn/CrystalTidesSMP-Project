import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BroadcastAlert from '../../components/UI/BroadcastAlert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof BroadcastAlert> = {
  title: 'UI/BroadcastAlert',
  component: BroadcastAlert,
  decorators: [
    (StoryComponent) => (
      <QueryClientProvider client={queryClient}>
        <div style={{ width: '100%', background: '#0b0c10', padding: '1rem 0' }}>
          <StoryComponent />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BroadcastAlert>;

export const InfoNotice: Story = {
  args: {
    mockConfig: {
      active: true,
      type: 'info',
      message: 'ℹ️ ¡Mantenimiento programado hoy a las 20:00 UTC!',
    },
  },
};

export const WarningAlert: Story = {
  args: {
    mockConfig: {
      active: true,
      type: 'alert',
      message: '⚠️ Actualización requerida para el cliente de Minecraft v1.21.1.',
    },
  },
};

export const CriticalError: Story = {
  args: {
    mockConfig: {
      active: true,
      type: 'error',
      message: '🚨 Servidor en reinicio de emergencia por mantenimiento de hardware.',
    },
  },
};
