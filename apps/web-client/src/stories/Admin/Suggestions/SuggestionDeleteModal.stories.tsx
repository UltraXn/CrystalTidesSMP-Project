import type { Meta, StoryObj } from '@storybook/react';
import SuggestionDeleteModal from '../../../components/Admin/Suggestions/SuggestionDeleteModal';

const meta: Meta<typeof SuggestionDeleteModal> = {
  title: 'Admin/Suggestions/SuggestionDeleteModal',
  component: SuggestionDeleteModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionDeleteModal>;

export const OpenModal: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('onClose clicked'),
    onConfirm: () => console.log('onConfirm clicked'),
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
