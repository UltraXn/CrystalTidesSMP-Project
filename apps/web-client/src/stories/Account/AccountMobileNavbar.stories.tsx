import type { Meta, StoryObj } from '@storybook/react-vite';
import AccountMobileNavbar from '../../components/Account/AccountMobileNavbar';

const meta: Meta<typeof AccountMobileNavbar> = {
  title: 'Account/AccountMobileNavbar',
  component: AccountMobileNavbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 w-full max-w-[400px] min-h-[200px] text-white relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccountMobileNavbar>;

export const Default: Story = {
    args: {
        activeTab: 'overview',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: false,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};

export const SettingsActive: Story = {
    args: {
        activeTab: 'settings',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: false,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};

export const ConnectionsActive: Story = {
    args: {
        activeTab: 'connections',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: false,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};

export const SidebarOpen: Story = {
    args: {
        activeTab: 'overview',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: true,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};
