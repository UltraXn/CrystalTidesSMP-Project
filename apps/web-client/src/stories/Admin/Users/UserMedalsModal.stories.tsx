import type { Meta, StoryObj } from '@storybook/react';
import UserMedalsModal from '../../../components/Admin/Users/UserMedalsModal';
import { UserDefinition, MedalDefinition } from '../../../components/Admin/Users/types';

const mockUser: UserDefinition = {
  id: 'usr-101',
  username: 'KilluMaster',
  email: 'killu@crystaltidessmp.net',
  role: 'killu',
  medals: [1, 3],
  created_at: new Date().toISOString()
};

const mockAvailableMedals: MedalDefinition[] = [
  { id: 1, name: 'Cazador de Dragones', color: '#8b5cf6', icon: '🐲', description: 'Por derrotar al Dragón del Ender en solitario' },
  { id: 2, name: 'Matador de Ignis', color: '#ef4444', icon: '🔥', description: 'Por sobrevivir al ataque final de Ignis' },
  { id: 3, name: 'Pilar de la Comunidad', color: '#3b82f6', icon: '💎', description: 'Contribuidor activo y donador del SMP' },
  { id: 4, name: 'Explorador Dimensional', color: '#10b981', icon: '🌌', description: 'Descubrió todas las estructuras dimensionales' },
  { id: 5, name: 'Maestro del Mercado', color: '#f59e0b', icon: '🪙', description: 'Alcanzó el millón de Killucoins comerciando' }
];

const meta: Meta<typeof UserMedalsModal> = {
  title: 'Admin/Users/UserMedalsModal',
  component: UserMedalsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserMedalsModal>;

export const Default: Story = {
  args: {
    user: mockUser,
    availableMedals: mockAvailableMedals,
    onClose: () => console.log('Close Medals modal'),
    onSave: () => console.log('Save medals'),
    saving: false,
    onToggleMedal: (id: number) => console.log('Toggle medal:', id)
  }
};

export const SavingState: Story = {
  args: {
    user: mockUser,
    availableMedals: mockAvailableMedals,
    onClose: () => console.log('Close Medals modal'),
    onSave: () => console.log('Save medals'),
    saving: true,
    onToggleMedal: (id: number) => console.log('Toggle medal:', id)
  }
};
