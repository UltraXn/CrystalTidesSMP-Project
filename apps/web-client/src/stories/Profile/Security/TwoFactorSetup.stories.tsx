import type { Meta, StoryObj } from '@storybook/react';
import TwoFactorSetup from '../../../components/Profile/Security/TwoFactorSetup';

const meta: Meta<typeof TwoFactorSetup> = {
  title: 'Profile/Security/TwoFactorSetup',
  component: TwoFactorSetup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TwoFactorSetup>;

export const DisabledTwoFactor: Story = {
  args: {
    mockEnabled: false,
    mockLoading: false,
    onSetup: async () => ({
      success: true,
      data: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="50%" y="50%" text-anchor="middle" fill="black" font-size="16">MOCK QR CODE</text></svg>'
      }
    })
  }
};

export const ActiveSetupInProgress: Story = {
  args: {
    mockEnabled: false,
    mockLoading: false,
    mockSetupData: {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="50%" y="50%" text-anchor="middle" fill="black" font-size="16">MOCK QR CODE</text></svg>'
    },
    onEnable: async () => ({ success: true })
  }
};

export const EnabledAndProtected: Story = {
  args: {
    mockEnabled: true,
    mockLoading: false,
    onDisable: async () => ({ success: true })
  }
};
