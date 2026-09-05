import type { Meta, StoryObj } from '@storybook/react';
import DonorsList from '../../../components/Admin/Donors/DonorsList';

const meta: Meta<typeof DonorsList> = {
  title: 'Admin/Donors/DonorsList',
  component: DonorsList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorsList>;

export const PopulatedData: Story = {
  args: {
    donors: [],
    onDragEnd: () => console.log('onDragEnd clicked'),
    onEdit: () => console.log('onEdit clicked'),
    onDelete: () => console.log('onDelete clicked'),
    onImport: () => console.log('onImport clicked'),
  },
};

export const LoadingTable: Story = {
  args: {
    
    
},
};
