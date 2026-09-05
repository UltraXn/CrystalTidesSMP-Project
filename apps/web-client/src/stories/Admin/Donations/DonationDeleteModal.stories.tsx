import type { Meta, StoryObj } from '@storybook/react';
import DonationDeleteModal from '../../../components/Admin/Donations/DonationDeleteModal';

const meta: Meta<typeof DonationDeleteModal> = {
  title: 'Admin/Donations/DonationDeleteModal',
  component: DonationDeleteModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonationDeleteModal>;

export const OpenModal: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('onClose clicked'),
    onConfirm: () => console.log('onConfirm clicked'),
    deleting: true,
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
