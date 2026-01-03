import type { Meta, StoryObj } from '@storybook/react';
import DonationsManager from '../../components/Admin/DonationsManager';

const meta = {
  title: 'Admin/DonationsManager',
  component: DonationsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DonationsManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Data
const mockDonations = [
  {
    id: 1,
    amount: 50.00,
    currency: 'USD',
    from_name: 'SuperFan123',
    message: 'Keep up the great work!',
    is_public: true,
    buyer_email: 'fan@example.com',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    amount: 10.00,
    currency: 'EUR',
    from_name: 'Anon',
    message: '',
    is_public: false,
    buyer_email: 'anon@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    amount: 100.00,
    currency: 'USD',
    from_name: 'WhaleUser',
    message: 'For the server handling!',
    is_public: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

export const Default: Story = {
  args: {
    mockDonations: mockDonations,
  },
};

export const Empty: Story = {
  args: {
    mockDonations: [],
  },
};

export const Loading: Story = {
  args: {
    // Component handles loading if mockDonations is undefined, but for story we simulate it via component internal state handling or just show empty structure
    // Since proper loading state depends on fetch, we might just stick to Default and Empty for visual regression.
  },
  render: () => <DonationsManager /> // Will trigger loading state initially
};
