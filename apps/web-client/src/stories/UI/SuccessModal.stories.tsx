import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import SuccessModal from '../../components/UI/SuccessModal';

const meta: Meta<typeof SuccessModal> = {
  title: 'UI/SuccessModal',
  component: SuccessModal,
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
type Story = StoryObj<typeof SuccessModal>;

export const AccountVerified: Story = {
  args: {
    isOpen: true,
    title: '¡Cuenta Sincronizada!',
    message: 'Tu usuario de Minecraft ha sido verificado con éxito en el servidor.',
    buttonText: 'Continuar al Panel',
    onClose: () => {},
  },
};
