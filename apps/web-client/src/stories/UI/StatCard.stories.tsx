import type { Meta, StoryObj } from '@storybook/react';
import StatCard from '../../components/UI/StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    percent: { control: 'text' },
    color: { control: 'color' },
    icon: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const ServerTPS: Story = {
  args: {
    title: 'RENDIMIENTO TPS',
    value: '20.0 TPS',
    percent: '+100% FLUIDO',
    color: '#89d9d1',
    icon: '⚡',
  },
};

export const HighRamUsage: Story = {
  args: {
    title: 'USO DE MEMORIA RAM',
    value: '22.4 GB',
    percent: '93% ALERTA',
    color: '#ef4444',
    icon: '⚠️',
  },
};

export const ActivePlayers: Story = {
  args: {
    title: 'JUGADORES EN LÍNEA',
    value: '42 / 100',
    percent: '+15 ESTA HORA',
    color: '#10b981',
    icon: '🎮',
  },
};

export const StorageUsage: Story = {
  args: {
    title: 'ESPACIO EN DISCO (NVME)',
    value: '185.2 GB',
    percent: '45% LIBRE',
    color: '#3b82f6',
    icon: '💾',
  },
};
