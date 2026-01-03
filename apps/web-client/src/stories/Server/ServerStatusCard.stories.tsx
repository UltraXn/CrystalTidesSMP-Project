import type { Meta, StoryObj } from '@storybook/react';
import ServerStatusCard from '../../components/Server/ServerStatusCard';

const meta = {
  title: 'Server/ServerStatusCard',
  component: ServerStatusCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServerStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Online State
export const Online: Story = {
  args: {
    status: {
        online: true,
        motd: 'Bienvenido a CrystalTides SMP',
        version: '1.21.1',
        players: {
            online: 15,
            max: 50,
            sample: []
        },
        icon: '',
        latency: 45
    },
    serverIp: 'mc.crystaltidesSMP.net'
  },
};

// Offline State
export const Offline: Story = {
  args: {
    status: {
        online: false,
        motd: '',
        version: '',
        players: {
            online: 0,
            max: 0,
            sample: []
        },
        icon: '',
    },
    serverIp: 'mc.crystaltidesSMP.net'
  },
};

// Full Server
export const FullHouse: Story = {
    args: {
      status: {
          online: true,
          motd: '¡Evento en vivo!',
          version: '1.21.1',
          players: {
              online: 50,
              max: 50,
              sample: []
          },
          icon: '',
          latency: 20
      },
      serverIp: 'mc.crystaltidesSMP.net'
    },
  };
