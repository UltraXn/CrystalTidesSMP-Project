import type { Meta, StoryObj } from '@storybook/react';
import PlayerStatsGrid from '../../components/User/PlayerStatsGrid';

const meta = {
  title: 'User/PlayerStatsGrid',
  component: PlayerStatsGrid,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <style>{`
            /* CSS from PublicProfile.tsx needed for the component to render correctly in isolation if not using global styles */
            .premium-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    transition: all 0.3s ease;
            }
        `}</style>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerStatsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockStats = {
    playtime: '120h',
    kills: 50,
    mob_kills: 1200,
    deaths: 10,
    money: '50,000',
    blocks_mined: '1.5M',
    blocks_placed: '500k'
};

export const Loaded: Story = {
  args: {
    stats: mockStats,
    loading: false,
    isPublic: true,
    isAdmin: false,
  },
};

export const Loading: Story = {
  args: {
    stats: null,
    loading: true,
    isPublic: true,
    isAdmin: false,
  },
};

export const Private: Story = {
  args: {
    stats: null,
    loading: false,
    isPublic: false,
    isAdmin: false,
  },
};

export const PrivateButAdmin: Story = {
    args: {
      stats: mockStats,
      loading: false,
      isPublic: false,
      isAdmin: true,
    },
  };
