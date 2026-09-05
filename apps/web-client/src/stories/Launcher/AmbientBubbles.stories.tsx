import type { Meta, StoryObj } from '@storybook/react';
import { AmbientBubbles } from '../../components/Launcher/AmbientBubbles';

const meta: Meta<typeof AmbientBubbles> = {
  title: 'Launcher/AmbientBubbles',
  component: AmbientBubbles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AmbientBubbles>;

export const LauncherAtmosphericBubbles: Story = {
  render: () => (
    <div style={{ height: '350px', background: '#0b0f19', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AmbientBubbles />
      <span style={{ color: '#38bdf8', fontFamily: 'monospace', zIndex: 2 }}>Partículas atmosféricas del Launcher</span>
    </div>
  )
};
