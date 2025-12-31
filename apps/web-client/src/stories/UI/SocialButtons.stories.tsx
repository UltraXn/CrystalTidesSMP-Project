import type { Meta, StoryObj } from '@storybook/react-vite';
import DiscordButton from '../../components/UI/DiscordButton';
import TwitchButton from '../../components/UI/TwitchButton';
import TwitterButton from '../../components/UI/TwitterButton';

const meta = {
  title: 'UI/SocialButtons',
  component: DiscordButton, // Default wrapper
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DiscordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Discord
export const Discord: Story = {
    render: () => <DiscordButton />
};

// Twitch
export const Twitch: StoryObj<typeof TwitchButton> = {
    render: () => <TwitchButton />
};

// Twitter
export const Twitter: StoryObj<typeof TwitterButton> = {
    render: () => <TwitterButton />
};
