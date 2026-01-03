import type { Meta, StoryObj } from '@storybook/react';
import StaffList from '../../components/Admin/Staff/StaffList';
import { DragDropContext } from '@hello-pangea/dnd';

const meta: Meta<typeof StaffList> = {
  title: 'Admin/Staff/StaffList',
  component: StaffList,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffList>;

const mockCards = [
    {
        id: 1,
        name: 'Neroferno',
        role: 'Neroferno',
        description: 'Founder',
        image: 'Neroferno',
        color: '#8b5cf6',
        socials: { discord: 'neroferno' }
    },
    {
        id: 2,
        name: 'Killuwu',
        role: 'Killuwu',
        description: 'Admin',
        image: 'Killuwu',
        color: '#0ea5e9',
        socials: { discord: 'killuwu' }
    }
];

export const Default: Story = {
  args: {
    cards: mockCards,
    onlineStatus: {
        'neroferno': { mc: 'online', discord: 'offline' },
        'killuwu': { mc: 'offline', discord: 'dnd' }
    },
    onDragEnd: (r) => console.log(r),
    onEdit: (c) => console.log('Edit', c),
    onDelete: (id) => console.log('Delete', id),
    onSync: () => console.log('Sync'),
    onAdd: () => console.log('Add'),
    syncing: false
  },
};
