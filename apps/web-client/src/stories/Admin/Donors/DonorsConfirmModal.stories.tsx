import type { Meta, StoryObj } from '@storybook/react';
import DonorsConfirmModal from '../../../components/Admin/Donors/DonorsConfirmModal';

const meta: Meta<typeof DonorsConfirmModal> = {
  title: 'Admin/Donors/DonorsConfirmModal',
  component: DonorsConfirmModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorsConfirmModal>;

export const DeleteDonorConfirmation: Story = {
  args: {
    isOpen: true,
    type: 'delete',
    onClose: () => console.log('Cancel delete'),
    onConfirm: () => console.log('Confirm delete')
  }
};

export const ImportDonorsConfirmation: Story = {
  args: {
    isOpen: true,
    type: 'import',
    onClose: () => console.log('Cancel import'),
    onConfirm: () => console.log('Confirm import')
  }
};
