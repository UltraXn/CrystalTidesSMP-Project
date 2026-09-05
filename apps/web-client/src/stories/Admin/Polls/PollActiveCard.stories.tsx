import type { Meta, StoryObj } from '@storybook/react';
import PollActiveCard from '../../../components/Admin/Polls/PollActiveCard';

const meta: Meta<typeof PollActiveCard> = {
  title: 'AdminPolls/PollActiveCard',
  component: PollActiveCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollActiveCard>;

export const ActivePollWithVotes: Story = {
  args: {
    poll: {
      id: 1,
      title: 'Expansión del Mapa',
      question: '¿Qué bioma debería tener la próxima expansión?',
      totalVotes: 342,
      closesIn: '3 días',
      is_active: true,
      options: [
        { id: 1, label: 'Bosque de Cristal Abisal', votes: 154, percent: 45 },
        { id: 2, label: 'Desierto de Obsidiana', votes: 103, percent: 30 },
        { id: 3, label: 'Cavernas de Iridium', votes: 62, percent: 18 },
        { id: 4, label: 'Islas Flotantes del Nether', votes: 23, percent: 7 },
      ],
    },
    onEdit: () => {},
    onDelete: () => {},
    onClose: () => {},
  },
};

export const NoPollEmptyState: Story = {
  args: {
    poll: null,
    onEdit: () => {},
    onDelete: () => {},
    onClose: () => {},
    onCreate: () => {},
  },
};
