import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import Toast from '../../components/UI/Toast';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ height: '200px', background: '#0b0c10', position: 'relative' }}>
          <StoryComponent />
        </div>
      </LazyMotion>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    type: { control: 'select', options: ['success', 'error', 'info'] },
    isVisible: { control: 'boolean' },
    duration: { control: { type: 'range', min: 1000, max: 10000, step: 500 } },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const SuccessNotification: Story = {
  args: {
    message: '¡Dirección IP mc.crystaltidessmp.net copiada al portapapeles!',
    type: 'success',
    isVisible: true,
    duration: 3000,
    onClose: () => {},
  },
};

export const ErrorNotification: Story = {
  args: {
    message: 'Error al conectar con el servicio de autenticación de Minecraft.',
    type: 'error',
    isVisible: true,
    duration: 3000,
    onClose: () => {},
  },
};

export const InfoNotification: Story = {
  args: {
    message: 'Nuevos artículos y cosméticos agregados a la tienda del servidor.',
    type: 'info',
    isVisible: true,
    duration: 3000,
    onClose: () => {},
  },
};

export const LongTextMessage: Story = {
  args: {
    message: 'Has desbloqueado el logro legendario "Conquistador del Abismo". Revisa tu inventario para reclamar tus Cristales.',
    type: 'success',
    isVisible: true,
    duration: 5000,
    onClose: () => {},
  },
};
