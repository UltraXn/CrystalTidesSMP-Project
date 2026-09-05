import type { Meta, StoryObj } from '@storybook/react';
import Minecraft3DServerRackCanvas from '../../components/Home/Minecraft3DServerRackCanvas';

const meta: Meta<typeof Minecraft3DServerRackCanvas> = {
  title: 'Home/3D/Minecraft3DServerRackCanvas',
  component: Minecraft3DServerRackCanvas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Minecraft3DServerRackCanvas>;

export const CyanAccentRack: Story = {
  args: {
    accentColor: '#38bdf8'
  },
  render: (args) => (
    <div style={{ width: '400px', height: '400px', background: '#090a10', borderRadius: '14px' }}>
      <Minecraft3DServerRackCanvas {...args} />
    </div>
  )
};

export const EmeraldAccentRack: Story = {
  args: {
    accentColor: '#10b981'
  },
  render: (args) => (
    <div style={{ width: '400px', height: '400px', background: '#090a10', borderRadius: '14px' }}>
      <Minecraft3DServerRackCanvas {...args} />
    </div>
  )
};
