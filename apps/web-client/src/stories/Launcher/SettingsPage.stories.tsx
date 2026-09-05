import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPage } from '../../components/Launcher/SettingsPage';

const meta: Meta<typeof SettingsPage> = {
  title: 'Launcher/SettingsPage',
  component: SettingsPage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

export const DefaultSettings: Story = {
  args: {
    "settings": {
        "theme": "dark",
        "language": "es",
        "notifications": true,
        "soundVolume": 80
    }
},
};

export const MutedEnglishSettings: Story = {
  args: {
    "settings": {
        "theme": "dark",
        "language": "en",
        "notifications": false,
        "soundVolume": 0
    }
},
};
