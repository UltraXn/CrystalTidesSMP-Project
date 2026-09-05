import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { within, userEvent, expect } from '@storybook/test';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'UI/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ height: '500px', background: '#0b0c10', position: 'relative' }}>
          <StoryComponent />
        </div>
      </LazyMotion>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    confirmText: { control: 'text' },
    cancelText: { control: 'text' },
    isDanger: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmationModal>;

export const DangerDeleteRealm: Story = {
  args: {
    isOpen: true,
    title: '¿Destruir Protección de Reino?',
    message: 'Esta acción desmantelará la protección del territorio y los bloques quedarán vulnerables en el mapa público.',
    confirmText: 'Sí, desmantelar',
    cancelText: 'Cancelar',
    isDanger: true,
    isLoading: false,
    onClose: () => {},
    onConfirm: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByText('¿Destruir Protección de Reino?');
    await expect(title).toBeInTheDocument();
    const confirmBtn = await canvas.findByRole('button', { name: 'Sí, desmantelar' });
    await userEvent.hover(confirmBtn);
  },
};

export const PrestigeUnlock: Story = {
  args: {
    isOpen: true,
    title: '¿Avanzar a Prestigio III (Oro)?',
    message: 'Se consumirán 1,500 Cristales de tu saldo de maestría para desbloquear la insignia de Prestigio III.',
    confirmText: 'Desbloquear Prestigio',
    cancelText: 'Volver',
    isDanger: false,
    isLoading: false,
    onClose: () => {},
    onConfirm: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByText('¿Avanzar a Prestigio III (Oro)?');
    await expect(title).toBeInTheDocument();
  },
};

export const ProcessingLoadingState: Story = {
  args: {
    isOpen: true,
    title: 'Procesando Transacción...',
    message: 'Por favor espera mientras el servidor valida el pago de Cristales.',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDanger: false,
    isLoading: true,
    onClose: () => {},
    onConfirm: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const processingBtn = await canvas.findByText('Procesando...');
    await expect(processingBtn).toBeInTheDocument();
  },
};
