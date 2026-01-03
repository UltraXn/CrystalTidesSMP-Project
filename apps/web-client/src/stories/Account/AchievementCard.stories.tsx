import type { Meta, StoryObj } from '@storybook/react';
import AchievementCard from './AchievementCard';

const meta = {
  title: 'Account/AchievementCard',
  component: AchievementCard,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AchievementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlocked: Story = {
  args: {
    title: 'Veterano de Guerra',
    description: 'Has jugado más de 50 horas en el servidor.',
    icon: '⚔️',
    unlocked: true,
    criteria: 'Jugar 50 horas',
  },
};

export const Locked: Story = {
  args: {
    title: 'Donador Legendario',
    description: 'Apoya al servidor adquiriendo un rango.',
    icon: '💎',
    unlocked: false,
    criteria: 'Adquirir rango VIP o superior',
  },
};
