import type { Meta, StoryObj } from '@storybook/react';
import BroadcastManager from '../../../components/Admin/Config/BroadcastManager';

const meta: Meta<typeof BroadcastManager> = {
  title: 'Admin/Config/BroadcastManager',
  component: BroadcastManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BroadcastManager>;

export const ActiveAlertBroadcast: Story = {
  args: {
    settings: {
      broadcast_config: JSON.stringify({
        message: '¡El evento de Guerra de Clanes inicia este sábado a las 20:00 UTC en el End!',
        type: 'alert',
        active: true
      })
    },
    onUpdate: (key, val) => console.log('Update setting:', key, val),
    saving: null
  }
};

export const InactiveInfoBroadcast: Story = {
  args: {
    settings: {
      broadcast_config: {
        message: 'Bienvenidos a la Temporada 4 de CrystalTides SMP.',
        type: 'info',
        active: false
      }
    },
    onUpdate: (key, val) => console.log('Update setting:', key, val),
    saving: null
  }
};
