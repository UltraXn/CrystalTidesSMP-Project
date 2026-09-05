import type { Meta, StoryObj } from '@storybook/react';
import PollDisplay from '../../components/Forum/PollDisplay';

const meta: Meta<typeof PollDisplay> = {
  title: 'Forum/PollDisplay',
  component: PollDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollDisplay>;

export const ActivePollWithVotes: Story = {
  args: {
    poll: {
      id: 'poll-001',
      question: '¿Qué bioma debería tener la próxima expansión del mapa?',
      totalVotes: 342,
      closesIn: '3 días',
      options: [
        { id: 'opt-1', label: 'Bosque de Cristal Abisal', percent: 45, votes: 154 },
        { id: 'opt-2', label: 'Desierto de Obsidiana', percent: 30, votes: 103 },
        { id: 'opt-3', label: 'Cavernas de Iridium', percent: 18, votes: 62 },
        { id: 'opt-4', label: 'Islas Flotantes del Nether', percent: 7, votes: 23 },
      ],
    },
    onVote: async (optionId) => {
      console.log('Voted for:', optionId);
    },
  },
};

export const DiscordLinkedPoll: Story = {
  args: {
    poll: {
      id: 'poll-002',
      question: '¿Cuándo deberíamos hacer el evento de PvP del Reino?',
      totalVotes: 0,
      closesIn: '5 días',
      discord_link: 'https://discord.gg/crystaltides',
      options: [],
    },
  },
};

export const NoPollAvailable: Story = {
  args: {
    poll: null,
  },
};
