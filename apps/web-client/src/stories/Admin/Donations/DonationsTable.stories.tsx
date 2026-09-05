import type { Meta, StoryObj } from '@storybook/react';
import DonationsTable from '../../../components/Admin/Donations/DonationsTable';
import { Donation } from '../../../components/Admin/Donations/types';

const mockDonationsList: Donation[] = [
  {
    id: 1,
    amount: 50.00,
    currency: 'USD',
    from_name: 'NeroFerno',
    message: 'Para el mantenimiento del host dedicado de Minecraft',
    is_public: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    amount: 15.00,
    currency: 'USD',
    from_name: 'SteveGamer',
    message: '¡Gracias por revivir el modpack!',
    is_public: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    amount: 100.00,
    currency: 'EUR',
    from_name: 'Donante Anónimo',
    message: 'Mantengan vivos los servidores de Cataclysm',
    is_public: false,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const meta: Meta<typeof DonationsTable> = {
  title: 'Admin/Donations/DonationsTable',
  component: DonationsTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonationsTable>;

export const PopulatedTable: Story = {
  args: {
    donations: mockDonationsList,
    loading: false,
    onEdit: (d) => console.log('Edit donation:', d),
    onDelete: (id) => console.log('Delete donation:', id),
    page: 1,
    totalPages: 3,
    setPage: (p) => console.log('Set page:', p)
  }
};

export const LoadingState: Story = {
  args: {
    donations: [],
    loading: true,
    onEdit: () => {},
    onDelete: () => {},
    page: 1,
    totalPages: 1,
    setPage: () => {}
  }
};

export const EmptyState: Story = {
  args: {
    donations: [],
    loading: false,
    onEdit: () => {},
    onDelete: () => {},
    page: 1,
    totalPages: 0,
    setPage: () => {}
  }
};
