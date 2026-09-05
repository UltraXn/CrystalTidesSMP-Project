import type { Meta, StoryObj } from '@storybook/react';
import DonationFormModal from '../../../components/Admin/Donations/DonationFormModal';
import { Donation } from '../../../components/Admin/Donations/types';

const mockDonation: Donation = {
  id: 42,
  amount: 25.00,
  currency: 'USD',
  from_name: 'AlexVibes',
  message: '¡Excelente trabajo con el servidor y los nuevos jefes!',
  is_public: true,
  buyer_email: 'alex@example.com',
  created_at: new Date().toISOString()
};

const meta: Meta<typeof DonationFormModal> = {
  title: 'Admin/Donations/DonationFormModal',
  component: DonationFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonationFormModal>;

export const EditExistingDonation: Story = {
  args: {
    isOpen: true,
    initialData: mockDonation,
    onClose: () => console.log('Close donation modal'),
    onSave: async (donation) => { console.log('Saved donation:', donation); },
    saving: false
  }
};

export const CreateNewDonation: Story = {
  args: {
    isOpen: true,
    initialData: null,
    onClose: () => console.log('Close donation modal'),
    onSave: async (donation) => { console.log('Created donation:', donation); },
    saving: false
  }
};
