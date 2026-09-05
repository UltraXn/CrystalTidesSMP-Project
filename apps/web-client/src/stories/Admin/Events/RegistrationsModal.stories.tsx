import type { Meta, StoryObj } from '@storybook/react';
import RegistrationsModal from '../../../components/Admin/Events/RegistrationsModal';
import { Registration } from '../../../components/Admin/Events/types';

const mockRegistrationsList: Registration[] = [
  {
    id: 101,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: {
      username: 'NeroFerno',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    }
  },
  {
    id: 102,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    profiles: {
      username: 'KilluMaster',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'
    }
  },
  {
    id: 103,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: {
      username: 'Steve_Warrior',
      avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'
    }
  }
];

const meta: Meta<typeof RegistrationsModal> = {
  title: 'Admin/Events/RegistrationsModal',
  component: RegistrationsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RegistrationsModal>;

export const PopulatedRegistrations: Story = {
  args: {
    eventId: 1,
    onClose: () => console.log('Close registrations modal'),
    API_URL: '/api',
    mockRegistrations: mockRegistrationsList
  }
};

export const EmptyRegistrations: Story = {
  args: {
    eventId: 1,
    onClose: () => console.log('Close registrations modal'),
    API_URL: '/api',
    mockRegistrations: []
  }
};
