import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminMobileNavbar from '../../components/Admin/AdminMobileNavbar';

const meta: Meta<typeof AdminMobileNavbar> = {
  title: 'Admin/AdminMobileNavbar',
  component: AdminMobileNavbar,
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
type Story = StoryObj<typeof AdminMobileNavbar>;

export const Default: Story = {
    args: {
        activeTab: 'overview',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: false,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};

export const StaffHubActive: Story = {
    args: {
        activeTab: 'staff_hub',
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

export const SidebarOpen: Story = {
    args: {
        activeTab: 'overview',
        setActiveTab: (tab) => console.log('SetActiveTab', tab),
        sidebarOpen: true,
        setSidebarOpen: (open) => console.log('SetSidebarOpen', open),
    }
};
