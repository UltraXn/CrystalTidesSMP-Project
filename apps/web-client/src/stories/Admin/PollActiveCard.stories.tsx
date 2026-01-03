import type { Meta, StoryObj } from '@storybook/react';
import PollActiveCard from '../../components/Admin/Polls/PollActiveCard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof PollActiveCard> = {
  title: 'Admin/Polls/PollActiveCard',
  component: PollActiveCard,
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
type Story = StoryObj<typeof PollActiveCard>;

const mockPoll = {
    id: 1,
    title: '¿Qué modo de juego prefieren?',
    question: 'Queremos añadir un nuevo modo de juego para el próximo mes. ¿Cuál prefieres?',
    options: [
        { label: 'SkyBlock', votes: 150, percent: 60 },
        { label: 'Survival', votes: 50, percent: 20 },
        { label: 'BedWars', votes: 50, percent: 20 }
    ],
    closesIn: '5 días',
    totalVotes: 250,
    created_at: new Date().toISOString(),
    is_active: true
};

export const Default: Story = {
  args: {
    poll: mockPoll,
    onEdit: () => console.log('Edit clicked'),
    onDelete: (id) => console.log('Delete clicked: ', id),
    onClose: (id) => console.log('Close clicked: ', id),
  },
};

export const Empty: Story = {
    args: {
      poll: null,
      onEdit: () => {},
      onDelete: () => {},
      onClose: () => {},
      onCreate: () => console.log('Create clicked')
    },
};
