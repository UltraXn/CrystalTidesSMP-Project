import type { Meta, StoryObj } from '@storybook/react';
import AccountSidebar from '../../components/Account/AccountSidebar';

const meta: Meta<any> = {
  title: 'Account/AccountSidebar',
  component: AccountSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const ProfileTabActive: Story = {
  args: {
    "activeTab": "profile",
    "username": "KilluBysmali",
    "role": "Prestigio IV (Diamante)"
},
};

export const SecurityTabActive: Story = {
  args: {
    "activeTab": "security",
    "username": "UltraXn",
    "role": "Fundador"
},
};
