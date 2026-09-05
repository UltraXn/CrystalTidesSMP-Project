import type { Meta, StoryObj } from '@storybook/react';
import StaffSyncModal from '../../../components/Admin/Staff/StaffSyncModal';

const meta: Meta<typeof StaffSyncModal> = {
  title: 'Admin/Staff/StaffSyncModal',
  component: StaffSyncModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffSyncModal>;

export const OpenModal: Story = {
  args: {
    isOpen: true,
    foundStaff: [],
    onClose: () => console.log('onClose clicked'),
    onConfirm: () => console.log('onConfirm clicked'),
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
