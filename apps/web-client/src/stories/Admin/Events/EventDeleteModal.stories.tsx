import type { Meta, StoryObj } from '@storybook/react';
import EventDeleteModal from '../../../components/Admin/Events/EventDeleteModal';

const meta: Meta<typeof EventDeleteModal> = {
  title: 'Admin/Events/EventDeleteModal',
  component: EventDeleteModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventDeleteModal>;

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
