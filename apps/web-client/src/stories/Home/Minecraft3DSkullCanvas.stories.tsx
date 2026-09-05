import type { Meta, StoryObj } from '@storybook/react';
import { Minecraft3DSkullCanvas } from '../../components/Home/Minecraft3DSkullCanvas';

const meta: Meta<typeof Minecraft3DSkullCanvas> = {
  title: 'Home/3D/Minecraft3DSkullCanvas',
  component: Minecraft3DSkullCanvas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Minecraft3DSkullCanvas>;

export const DefaultIconSize: Story = {
  args: {
    size: 64
  }
};

export const LargeDisplaySize: Story = {
  args: {
    size: 180
  },
  render: (args) => (
    <div style={{ padding: '2rem', background: '#090a10', borderRadius: '16px', border: '1px solid rgba(255,0,50,0.2)' }}>
      <Minecraft3DSkullCanvas {...args} />
    </div>
  )
};
