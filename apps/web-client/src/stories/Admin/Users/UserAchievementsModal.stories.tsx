import type { Meta, StoryObj } from '@storybook/react';
import UserAchievementsModal from '../../../components/Admin/Users/UserAchievementsModal';
import { UserDefinition, AchievementDefinition } from '../../../components/Admin/Users/types';

const mockUser: UserDefinition = {
  id: 'usr-steve',
  username: 'SteveGamer',
  email: 'steve@crystaltides.net',
  role: 'user',
  achievements: ['ach-first-kill', 'ach-speedrun-trial'],
  created_at: new Date().toISOString()
};

const mockAvailableAchievements: AchievementDefinition[] = [
  { id: 'ach-first-kill', name: 'Primera Sangre', description: 'Eliminaste a tu primer monstruo hostil', criteria: 'Kill 1 mob', icon: '⚔️' },
  { id: 'ach-speedrun-trial', name: 'Velocista de Mazmorras', description: 'Completaste una cámara de juicio en menos de 5 minutos', criteria: 'Complete trial < 5m', icon: '⚡' },
  { id: 'ach-gacha-legendary', name: 'Favor de la Fortuna', description: 'Obtuviste un objeto de rareza Legendaria en el Gacha', criteria: 'Roll legendary item', icon: '🌟' },
  { id: 'ach-market-tycoon', name: 'Magnate de la Bolsa', description: 'Realizaste más de 100 transacciones exitosas en la Bolsa', criteria: '100 market trades', icon: '📈' },
  { id: 'ach-boss-slayer', name: 'Terror de Calamidades', description: 'Derrotaste a 5 jefes de Cataclysm en modo difícil', criteria: 'Defeat 5 cataclysm bosses', icon: '👑' }
];

const meta: Meta<typeof UserAchievementsModal> = {
  title: 'Admin/Users/UserAchievementsModal',
  component: UserAchievementsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserAchievementsModal>;

export const Default: Story = {
  args: {
    user: mockUser,
    availableAchievements: mockAvailableAchievements,
    onClose: () => console.log('Close Achievements modal'),
    onSave: () => console.log('Save achievements'),
    saving: false,
    onToggleAchievement: (id: string | number) => console.log('Toggle achievement:', id)
  }
};
