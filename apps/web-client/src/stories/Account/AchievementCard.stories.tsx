import type { Meta, StoryObj } from '@storybook/react';
import { Sword, Pickaxe, Crown, Compass } from 'lucide-react';
import AchievementCard from '../../components/Account/AchievementCard';

const meta: Meta<typeof AchievementCard> = {
  title: 'Account/AchievementCard',
  component: AchievementCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    unlocked: { control: 'boolean' },
    color: { control: 'color' },
    criteria: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AchievementCard>;

export const UnlockedPrestigeAchievement: Story = {
  args: {
    title: 'Maestría del Constructor',
    description: 'Has colocado más de 50,000 bloques en el servidor.',
    icon: <Pickaxe size={32} />,
    unlocked: true,
    color: '#F59E0B',
    criteria: '50,000 bloques colocados',
    onShare: () => alert('Compartiendo logro...'),
  },
};

export const LockedAchievement: Story = {
  args: {
    title: 'Rey del Abismo',
    description: 'Derrota al Warden 10 veces sin morir.',
    icon: <Crown size={32} />,
    unlocked: false,
    color: '#E879F9',
    criteria: '0/10 Warden derrotados',
  },
};

export const CombatAchievement: Story = {
  args: {
    title: 'Luchador Imparable',
    description: 'Elimina a 500 mobs hostiles en una sola sesión.',
    icon: <Sword size={32} />,
    unlocked: true,
    color: '#EF4444',
    criteria: '500 mobs eliminados',
    onShare: () => {},
  },
};

export const ExplorerAchievement: Story = {
  args: {
    title: 'Cartógrafo Abisal',
    description: 'Explora 100 chunks únicos del mapa.',
    icon: <Compass size={32} />,
    unlocked: true,
    color: '#38BDF8',
    criteria: '100 chunks explorados',
  },
};
