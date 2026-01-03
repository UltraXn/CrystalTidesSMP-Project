import type { Meta, StoryObj } from '@storybook/react';
import DonorsList from '../../components/Admin/Donors/DonorsList';
import { Donor } from '../../components/Admin/Donors/DonorFormModal';
import { DragDropContext } from '@hello-pangea/dnd';

const meta: Meta<typeof DonorsList> = {
  title: 'Admin/Donors/DonorsList',
  component: DonorsList,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorsList>;

const mockDonors: Donor[] = [
    {
        id: '1',
        name: 'Killu Bysmali',
        skinUrl: 'https://mc-heads.net/avatar/Killu/64',
        description: 'Founder and main developer',
        ranks: ['killu', 'developer'],
        isPremium: true
    },
    {
        id: '2',
        name: 'Neroferno',
        skinUrl: 'https://mc-heads.net/avatar/Neroferno/64',
        description: 'Community Manager',
        ranks: ['neroferno', 'admin'],
        isPremium: true
    },
    {
        id: '3',
        name: 'Steve',
        skinUrl: '',
        description: 'Just a regular donor',
        ranks: ['donador'],
        isPremium: false
    }
];

export const Default: Story = {
  args: {
    donors: mockDonors,
    onDragEnd: (result) => console.log('Dragged', result),
    onEdit: (donor) => console.log('Edit', donor),
    onDelete: (id) => console.log('Delete', id),
    onImport: () => console.log('Import')
  },
  decorators: [
    (Story) => (
       <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <Story />
       </div>
    )
  ]
};

export const Empty: Story = {
    args: {
      donors: [],
      onDragEnd: () => {},
      onEdit: () => {},
      onDelete: () => {},
      onImport: () => console.log('Import clicked')
    },
};
