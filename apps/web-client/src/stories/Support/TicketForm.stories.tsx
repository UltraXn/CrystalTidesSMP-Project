import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import TicketForm from '../../components/Support/TicketForm';

const meta: Meta<typeof TicketForm> = {
  title: 'Support/TicketForm',
  component: TicketForm,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0c10', padding: '2rem' }}>
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
type Story = StoryObj<typeof TicketForm>;

export const CreateNewTicketModal: Story = {
  args: {
    onClose: () => {},
    onSubmit: async (data) => {
      console.log('Ticket submitted:', data);
    },
  },
};
