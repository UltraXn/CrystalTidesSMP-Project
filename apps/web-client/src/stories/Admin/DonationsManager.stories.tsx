import type { Meta, StoryObj } from '@storybook/react';
import DonationsManager from '../../components/Admin/DonationsManager';
import { Donation } from '../../components/Admin/Donations/types';

const mockDonationsList: Donation[] = [
  {
    id: 1,
    amount: 100.00,
    currency: 'USD',
    from_name: 'NeroFerno',
    message: 'Aporte para los nuevos plugins y optimizaciones.',
    is_public: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    amount: 25.00,
    currency: 'USD',
    from_name: 'KilluMaster',
    message: '¡Excelente trabajo en la Wiki!',
    is_public: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    amount: 50.00,
    currency: 'EUR',
    from_name: 'AlexVibes',
    message: 'Para el evento de clanes.',
    is_public: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const meta: Meta<typeof DonationsManager> = {
  title: 'Admin/Donations/DonationsManager',
  component: DonationsManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonationsManager>;

export const PopulatedDonationsDashboard: Story = {
  args: {
    mockDonations: mockDonationsList
  }
};

export const EmptyDonationsDashboard: Story = {
  args: {
    mockDonations: []
  }
};
