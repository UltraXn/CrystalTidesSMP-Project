import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from '../../components/Launcher/MainLayout';

const meta: Meta<typeof MainLayout> = {
  title: 'Launcher/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const FullLauncherApp: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', background: '#0b0f19' }}>
      <MainLayout />
    </div>
  )
};
