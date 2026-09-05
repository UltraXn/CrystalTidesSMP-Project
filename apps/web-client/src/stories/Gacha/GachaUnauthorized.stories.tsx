import type { Meta, StoryObj } from '@storybook/react';
import { GachaUnauthorized } from '../../pages/Gacha/GachaUnauthorized';

const meta: Meta<typeof GachaUnauthorized> = {
  title: 'Pages/Gacha/GachaUnauthorized',
  component: GachaUnauthorized,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaUnauthorized>;

export const GuestAccess: Story = {
  args: {
    userRole: 'Guest',
    onMockLogin: (role) => console.log('Mock login as:', role)
  }
};

export const UnlinkedMinecraftAccount: Story = {
  args: {
    userRole: 'Unverified Player',
    onMockLogin: (role) => console.log('Mock login as:', role)
  }
};
