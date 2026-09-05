import type { Meta, StoryObj } from '@storybook/react';
import ProfileSettings from '../../components/Account/ProfileSettings';

const meta: Meta<any> = {
  title: 'Account/ProfileSettings',
  component: ProfileSettings,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

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
