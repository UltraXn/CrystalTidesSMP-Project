import type { Meta, StoryObj } from '@storybook/react';
import { Trophy } from 'lucide-react';
import ShareableCard from '../../components/Account/ShareableCard';

const meta: Meta<typeof ShareableCard> = {
  title: 'Account/ShareableCard',
  component: ShareableCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ShareableCard>;

export const ShareUnlockedAchievement: Story = {
  args: {
    username: 'KilluBysmali',
    achievement: {
      title: 'Maestría del Constructor',
      description: 'Has colocado más de 50,000 bloques en el servidor.',
      icon: <Trophy size={32} />,
      unlocked: true,
      color: '#F59E0B',
    },
    onClose: () => {},
  },
};
