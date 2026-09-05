import type { Meta, StoryObj } from '@storybook/react';
import StaffList from '../../../components/Admin/Staff/StaffList';
import { StaffCardData } from '../../../components/Admin/Staff/StaffFormModal';

const mockStaffCards: StaffCardData[] = [
  {
    id: 1,
    name: 'NeroFerno',
    mc_nickname: 'NeroFerno',
    role: 'Neroferno',
    image: 'https://mc-heads.net/avatar/NeroFerno/100',
    color: '#db7700',
    description: 'Fundador y Lead Dev de CrystalTides SMP.',
    socials: { discord: 'neroferno' }
  },
  {
    id: 2,
    name: 'Killu',
    mc_nickname: 'Killu',
    role: 'Killuwu',
    image: 'https://mc-heads.net/avatar/Killu/100',
    color: '#ff69b4',
    description: 'Co-fundadora y Community Manager.',
    socials: { discord: 'killuwu' }
  },
  {
    id: 3,
    name: 'AlexDev',
    mc_nickname: 'Alex',
    role: 'Developer',
    image: 'https://mc-heads.net/avatar/Alex/100',
    color: '#3b82f6',
    description: 'Desarrollador de plugins de Spigot y Paper.',
    socials: { discord: 'alex_dev' }
  }
];

const meta: Meta<typeof StaffList> = {
  title: 'Admin/Staff/StaffList',
  component: StaffList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffList>;

export const Default: Story = {
  args: {
    cards: mockStaffCards,
    onlineStatus: {
      '1': { mc: 'online', discord: 'dnd' },
      '2': { mc: 'offline', discord: 'online' },
      '3': { mc: 'online', discord: 'idle' }
    },
    onDragEnd: (result) => console.log('Reordered staff list:', result),
    onEdit: (card) => console.log('Edit staff card:', card),
    onDelete: (id) => console.log('Delete staff card:', id),
    onSync: () => console.log('Sync staff with Discord/Minecraft'),
    onAdd: () => console.log('Open Add Staff modal'),
    syncing: false
  }
};
