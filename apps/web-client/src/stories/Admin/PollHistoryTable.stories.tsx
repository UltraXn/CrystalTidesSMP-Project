import type { Meta, StoryObj } from '@storybook/react';
import PollHistoryTable from '../../components/Admin/Polls/PollHistoryTable';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof PollHistoryTable> = {
  title: 'Admin/Polls/PollHistoryTable',
  component: PollHistoryTable,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', padding: '2rem', minHeight: '100vh' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PollHistoryTable>;

const mockPolls = [
    {
        id: 1,
        title: 'Evento de Navidad',
        question: '¿Les gustó el evento?',
        options: [],
        totalVotes: 500,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        is_active: false
    },
    {
        id: 2,
        title: 'Nuevo Lobby',
        question: '¿Qué opinan del nuevo lobby?',
        options: [],
        totalVotes: 1200,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        is_active: true
    }
];

export const Default: Story = {
  args: {
    polls: mockPolls,
    loading: false,
    page: 1,
    totalPages: 3,
    onPageChange: (p) => console.log('Page change:', p),
    onDelete: (id) => console.log('Delete:', id),
    onClose: (id) => console.log('Close:', id)
  },
};

export const Loading: Story = {
    args: {
        polls: [],
        loading: true,
        page: 1,
        totalPages: 1,
        onPageChange: () => {},
        onDelete: () => {},
        onClose: () => {}
      },
};

export const Empty: Story = {
    args: {
        polls: [],
        loading: false,
        page: 1,
        totalPages: 1,
        onPageChange: () => {},
        onDelete: () => {},
        onClose: () => {}
      },
};
