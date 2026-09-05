import type { Meta, StoryObj } from '@storybook/react';
import PollDeleteModal from '../../../components/Admin/Polls/PollDeleteModal';

const meta: Meta<typeof PollDeleteModal> = {
  title: 'Admin/Polls/PollDeleteModal',
  component: PollDeleteModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollDeleteModal>;

export const OpenModal: Story = {
  args: {
    onConfirm: () => console.log('onConfirm clicked'),
    onCancel: () => console.log('onCancel clicked'),
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
