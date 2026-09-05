import type { Meta, StoryObj } from '@storybook/react';
import CreateTicketModal from '../../../components/Admin/Tickets/CreateTicketModal';

const meta: Meta<typeof CreateTicketModal> = {
  title: 'Admin/Tickets/CreateTicketModal',
  component: CreateTicketModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateTicketModal>;

export const Default: Story = {
  args: {
    onClose: () => console.log('Close CreateTicket modal'),
    onSuccess: () => console.log('Ticket created successfully'),
    user: { id: 'usr-demo-01' }
  }
};
