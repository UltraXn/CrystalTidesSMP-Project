import type { Meta, StoryObj } from '@storybook/react';
import ProfileHeader from '../../components/User/ProfileHeader';

const meta: Meta<typeof ProfileHeader> = {
  title: 'User/ProfileHeader',
  component: ProfileHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileHeader>;

export const PlayerProfileBannerHeader: Story = {
  args: {
    profile: {
      id: 'usr-100',
      username: 'KilluBysmali',
      minecraft_nick: 'KilluBysmali',
      role: 'staff',
      reputation: 342,
      status_message: 'Construyendo la Capital del Reino en x: 1200, z: -450 🏰',
      profile_banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    },
    currentUser: {
      id: 'usr-101',
    },
    onGiveKarma: () => {},
    givingKarma: false,
  },
};
