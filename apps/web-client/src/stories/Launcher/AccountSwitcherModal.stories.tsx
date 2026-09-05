import type { Meta, StoryObj } from '@storybook/react';
import { AccountSwitcherModal } from '../../components/Launcher/AccountSwitcherModal';

const meta: Meta<typeof AccountSwitcherModal> = {
  title: 'Launcher/AccountSwitcherModal',
  component: AccountSwitcherModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountSwitcherModal>;

export const OpenModal: Story = {
  args: {
    onClose: () => console.log('onClose clicked'),
    onNavigateSettings: () => console.log('onNavigateSettings clicked'),
  }
};

export const LoadingState: Story = {
  args: {
    
    
},
};
