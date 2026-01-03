import type { Meta, StoryObj } from '@storybook/react';
import CreateTicketModal from '../../components/Admin/Tickets/CreateTicketModal';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof CreateTicketModal> = {
  title: 'Admin/Tickets/CreateTicketModal',
  component: CreateTicketModal,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div style={{height: '100vh', width: '100vw', background: '#333'}}>
             <Story />
        </div>
      </I18nextProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CreateTicketModal>;

export const Default: Story = {
  args: {
    onClose: () => console.log('Close Modal'),
    onSuccess: () => console.log('Success Create'),
    user: { id: 'user-id' }
  },
};
