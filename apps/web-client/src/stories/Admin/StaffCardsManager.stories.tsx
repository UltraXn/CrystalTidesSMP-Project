import type { Meta, StoryObj } from '@storybook/react';
import StaffCardsManager from '../../components/Admin/StaffCardsManager';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof StaffCardsManager> = {
  title: 'Admin/Staff/StaffCardsManager',
  component: StaffCardsManager,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', padding: '2rem' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StaffCardsManager>;

const mockStaff = [
    {
        id: 1,
        name: 'Neroferno',
        role: 'Neroferno',
        description: 'Founder & Lead Developer',
        image: 'Neroferno',
        color: '#8b5cf6',
        socials: { twitter: 'twitter', discord: 'discord_user', youtube: '', twitch: '' }
    },
    {
        id: 2,
        name: 'Killuwu',
        role: 'Killuwu',
        description: 'Community Manager & Co-Owner',
        image: 'Killuwu',
        color: '#ec4899',
        socials: { twitter: '', discord: 'discord_user', youtube: '', twitch: '' }
    },
    {
        id: 3,
        name: 'CoolAdmin',
        role: 'Admin',
        description: 'Keeping the server safe.',
        image: 'Steve',
        color: '#ef4444',
        socials: { twitter: '', discord: 'discord_user', youtube: '', twitch: '' }
    }
];

const mockOnlineStatus = {
    'neroferno': { mc: 'online', discord: 'dnd' },
    'killuwu': { mc: 'offline', discord: 'online' },
    'cooladmin': { mc: 'online', discord: 'online' }
};

export const Default: Story = {
  args: {
    mockCards: mockStaff,
    mockOnlineStatus: mockOnlineStatus
  },
};

export const Empty: Story = {
  args: {
    mockCards: [],
    mockOnlineStatus: {}
  },
};
