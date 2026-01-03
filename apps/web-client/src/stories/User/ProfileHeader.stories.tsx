import type { Meta, StoryObj } from '@storybook/react';
import ProfileHeader from '../../components/User/ProfileHeader';
import PlayerStatsGrid from '../../components/User/PlayerStatsGrid';

// Meta for ProfileHeader
const headerMeta = {
  title: 'User/ProfileHeader',
  component: ProfileHeader,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileHeader>;

export default headerMeta;
type HeaderStory = StoryObj<typeof headerMeta>;

const mockProfile = {
    id: '1',
    username: 'Killua_Zoldyck',
    role: 'owner',
    reputation: 999,
    avatar_preference: 'minecraft' as const,
    created_at: '2024-01-01',
    public_stats: true
};

export const HeaderDefault: HeaderStory = {
  args: {
    profile: mockProfile,
    currentUser: { id: '2' },
    givingKarma: false,
    onGiveKarma: () => alert('Karma given!'),
  },
};

export const HeaderLoadingKarma: HeaderStory = {
  args: {
    ...HeaderDefault.args,
    givingKarma: true,
  },
};

// Meta for PlayerStatsGrid
// Note: In a real setup we might use separate files, but for speed we can iterate here or separate them. 
// Storybook prefers one default export per file usually. 
// I will create a separate file for PlayerStatsGrid to follow best practices.
