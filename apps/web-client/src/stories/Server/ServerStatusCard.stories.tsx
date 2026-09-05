import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import ServerStatusCard from '../../components/Server/ServerStatusCard';

const meta: Meta<typeof ServerStatusCard> = {
  title: 'Server/ServerStatusCard',
  component: ServerStatusCard,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: '#0b0c10' }}>
          <StoryComponent />
        </div>
      </LazyMotion>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ServerStatusCard>;

export const ServerOnlineHighActivity: Story = {
  args: {
    serverIp: 'play.crystaltidessmp.net',
    status: {
      online: true,
      motd: '⚡ CrystalTides SMP 1.21.1 - ¡Temporada de Reinos Activa! ⚔️',
      version: '1.21.1 Modded',
      icon: '/images/server_icon.png',
      players: {
        online: 142,
        max: 200,
        sample: [],
      },
    },
  },
};

export const ServerOfflineMaintenance: Story = {
  args: {
    serverIp: 'play.crystaltidessmp.net',
    status: {
      online: false,
      motd: '🛠️ Mantenimiento programado de actualización a v2.4.0',
      version: '1.21.1',
      icon: '/images/server_icon.png',
      players: {
        online: 0,
        max: 200,
        sample: [],
      },
    },
  },
};
