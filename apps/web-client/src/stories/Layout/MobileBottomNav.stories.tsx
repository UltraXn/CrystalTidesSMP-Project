import type { Meta, StoryObj } from '@storybook/react';
import MobileBottomNav from '../../components/Layout/MobileBottomNav';

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Layout/MobileBottomNav',
  component: MobileBottomNav,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileBottomNav>;

export const MobileNavigationTabBar: Story = {
  render: () => (
    <div style={{ minHeight: '600px', background: '#0b0c10', position: 'relative' }}>
      <MobileBottomNav />
    </div>
  ),
};
