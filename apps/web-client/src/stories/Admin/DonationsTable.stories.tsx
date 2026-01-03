import type { Meta, StoryObj } from '@storybook/react-vite';
import DonationsTable from '../../components/Admin/Donations/DonationsTable';

const meta: Meta<typeof DonationsTable> = {
  title: 'Admin/Donations/DonationsTable',
  component: DonationsTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DonationsTable>;

const MOCK_DONATIONS = [
    { id: 1, from_name: 'UltraXn', buyer_email: 'ultra@example.com', amount: 100, currency: 'USD', message: '¡Gran servidor!', is_public: true, created_at: new Date().toISOString() },
    { id: 2, from_name: null, buyer_email: 'anon@example.com', amount: 15.5, currency: 'USD', message: '', is_public: false, created_at: new Date().toISOString() },
    { id: 3, from_name: 'Killu', buyer_email: 'killu@example.com', amount: 50, currency: 'EUR', message: 'Hype!', is_public: true, created_at: new Date().toISOString() },
];

export const Default: Story = {
    args: {
        donations: MOCK_DONATIONS,
        loading: false,
        onEdit: (d) => console.log('Edit', d),
        onDelete: (id) => console.log('Delete', id),
        page: 1,
        totalPages: 3,
        setPage: (p) => console.log('SetPage', p)
    }
};

export const Empty: Story = {
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

export const Loading: Story = {
    args: {
        donations: [],
        loading: true,
        onEdit: () => {},
        onDelete: () => {},
        page: 1,
        totalPages: 0,
        setPage: () => {}
    }
};
