import type { Meta, StoryObj } from '@storybook/react';
import { WindowTitleBar } from '../../components/Launcher/WindowTitleBar';

const meta: Meta<typeof WindowTitleBar> = {
  title: 'Launcher/WindowTitleBar',
  component: WindowTitleBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WindowTitleBar>;

export const DesktopWindowTitleBar: Story = {
  render: () => (
    <div style={{ background: '#0b0c10', padding: '1rem' }}>
      <WindowTitleBar />
    </div>
  ),
};
