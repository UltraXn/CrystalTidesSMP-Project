import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import PremiumAlert from '../../components/UI/PremiumAlert';

const meta: Meta<typeof PremiumAlert> = {
  title: 'UI/PremiumAlert',
  component: PremiumAlert,
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
type Story = StoryObj<typeof PremiumAlert>;

export const SuccessVariant: Story = {
  args: {
    isOpen: true,
    variant: 'success',
    title: '¡Rango Sincronizado!',
    message: 'Se han aplicado correctamente los permisos del rango Donador a tu perfil.',
    onClose: () => {},
  },
};

export const WarningVariant: Story = {
  args: {
    isOpen: true,
    variant: 'warning',
    title: 'Advertencia de Seguridad',
    message: 'Te recomendamos activar la autenticación de dos factores (2FA) en tu cuenta.',
    onClose: () => {},
  },
};

export const ErrorVariant: Story = {
  args: {
    isOpen: true,
    variant: 'error',
    title: 'Error de Autenticación',
    message: 'La sesión ha expirado. Por favor inicia sesión nuevamente.',
    onClose: () => {},
  },
};
