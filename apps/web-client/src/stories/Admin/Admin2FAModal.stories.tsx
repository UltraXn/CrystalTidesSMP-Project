import type { Meta, StoryObj } from '@storybook/react';
import Admin2FAModal from '../../components/Admin/Admin2FAModal';

const meta: Meta<typeof Admin2FAModal> = {
  title: 'Admin/Admin2FAModal',
  component: Admin2FAModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Admin2FAModal>;

export const OpenModal: Story = {
  args: {
    isOpen: true,
    onVerified: () => console.log('onVerified clicked'),
    onClose: () => console.log('onClose clicked'),
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
