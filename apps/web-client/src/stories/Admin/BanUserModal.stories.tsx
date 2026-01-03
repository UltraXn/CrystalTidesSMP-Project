import type { Meta, StoryObj } from '@storybook/react';
import BanUserModal from '../../components/Admin/Tickets/BanUserModal';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof BanUserModal> = {
  title: 'Admin/Tickets/BanUserModal',
  component: BanUserModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div style={{height: '100vh', width: '100vw', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             <Story />
        </div>
      </I18nextProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BanUserModal>;

export const Default: Story = {
  args: {
    onClose: () => console.log('Close Modal'),
    onSuccess: () => console.log('Success Ban'),
  },
};
