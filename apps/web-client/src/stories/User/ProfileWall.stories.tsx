import type { Meta, StoryObj } from '@storybook/react';
import ProfileWall from '../../components/User/ProfileWall';
import { ProfileComment } from '../../services/profileCommentService';

const mockComments: ProfileComment[] = [
  {
    id: 1,
    content: '¡Gran batalla contra Ignis! Gracias por el carry en la mazmorra del Nether 🔥',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    author_id: 'usr-alex',
    author: {
      username: 'AlexHunter',
      avatar_url: 'https://mc-heads.net/avatar/Alex/100',
      role: 'staff',
      minecraft_nick: 'AlexHunter'
    }
  },
  {
    id: 2,
    content: '¡Tu base en el bioma de cerezos es una obra de arte! Deberías postularla para el tour del servidor.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author_id: 'usr-steve',
    author: {
      username: 'SteveBuilder',
      avatar_url: 'https://mc-heads.net/avatar/Steve/100',
      role: 'donador',
      minecraft_nick: 'SteveBuilder'
    }
  },
  {
    id: 3,
    content: 'Felicidades por alcanzar el Prestigio III y el rango de Top 1 en daño del servidor 💎',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    author_id: 'usr-killu',
    author: {
      username: 'Killu',
      avatar_url: 'https://mc-heads.net/avatar/Killu/100',
      role: 'killu',
      minecraft_nick: 'Killu'
    }
  }
];

const meta: Meta<typeof ProfileWall> = {
  title: 'User/ProfileWall',
  component: ProfileWall,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileWall>;

export const PopulatedWall: Story = {
  args: {
    profileId: 'usr-nero-01',
    isAdmin: true,
    mockComments: mockComments
  }
};

export const EmptyWall: Story = {
  args: {
    profileId: 'usr-new-player',
    isAdmin: false,
    mockComments: []
  }
};
