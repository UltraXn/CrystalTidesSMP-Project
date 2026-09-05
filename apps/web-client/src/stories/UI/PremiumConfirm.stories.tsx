import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import PremiumConfirm from '../../components/UI/PremiumConfirm';

const meta: Meta<typeof PremiumConfirm> = {
  title: 'UI/PremiumConfirm',
  component: PremiumConfirm,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ height: '450px', background: '#0b0c10', position: 'relative' }}>
          <StoryComponent />
        </div>
      </LazyMotion>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PremiumConfirm>;

export const ConfirmPurgeData: Story = {
  args: {
    isOpen: true,
    variant: 'danger',
    title: '¿Confirmar Purgar Datos?',
    message: 'Esta acción borrará la caché local de chunks y descargará los paquetes de texturas nuevamente.',
    confirmLabel: 'Sí, purgar',
    cancelLabel: 'Cancelar',
    onConfirm: () => {},
    onCancel: () => {},
  },
};
