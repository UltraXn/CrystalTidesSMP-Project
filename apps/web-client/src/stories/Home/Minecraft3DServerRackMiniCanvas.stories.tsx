import type { Meta, StoryObj } from '@storybook/react';
import { Minecraft3DServerRackMiniCanvas } from '../../components/Home/Minecraft3DServerRackMiniCanvas';

const meta: Meta<typeof Minecraft3DServerRackMiniCanvas> = {
  title: 'Home/3D/Minecraft3DServerRackMiniCanvas',
  component: Minecraft3DServerRackMiniCanvas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Minecraft3DServerRackMiniCanvas>;

export const MiniServerRackBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#090a10', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ width: '48px', height: '48px' }}>
        <Minecraft3DServerRackMiniCanvas />
      </div>
      <div>
        <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>Servidor Dedicado Principal</h4>
        <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>● Online (99.9% Uptime)</span>
      </div>
    </div>
  )
};
