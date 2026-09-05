import type { Meta, StoryObj } from '@storybook/react';
import ConnectionCards from '../../components/Account/ConnectionCards';

const meta: Meta<any> = {
  title: 'Account/ConnectionCards',
  component: ConnectionCards,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const AllConnected: Story = {
  args: {
    "discordConnected": true,
    "minecraftConnected": true,
    "discordTag": "Killu#1337",
    "mcUsername": "KilluBysmali"
},
};

export const MinecraftOnlyConnected: Story = {
  args: {
    "discordConnected": false,
    "minecraftConnected": true,
    "mcUsername": "Steve"
},
};
