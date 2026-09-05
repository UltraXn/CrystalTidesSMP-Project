import type { Meta, StoryObj } from '@storybook/react';
import { Minecraft3DAltarCanvas } from '../../components/Home/Minecraft3DAltarCanvas';

const meta: Meta<typeof Minecraft3DAltarCanvas> = {
  title: 'Home/3D/Minecraft3DAltarCanvas',
  component: Minecraft3DAltarCanvas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Minecraft3DAltarCanvas>;

export const DefaultAltarStage: Story = {
  args: {
    stageId: 1,
    accentColor: '#89d9d1',
    linkedMembersList: ['KillubysmaliVT', 'Neroferno ultranix']
  },
  render: (args) => (
    <div style={{ width: '600px', height: '500px', background: '#090a10', borderRadius: '16px', overflow: 'hidden' }}>
      <Minecraft3DAltarCanvas {...args} />
    </div>
  )
};

export const ActiveStaffFlaringAltar: Story = {
  args: {
    stageId: 2,
    accentColor: '#ff00b7',
    activeStaffColor: '#e879f9',
    linkedMembersList: ['Neroferno ultranix', 'Xurlito', 'JAPA325']
  },
  render: (args) => (
    <div style={{ width: '600px', height: '500px', background: '#090a10', borderRadius: '16px', overflow: 'hidden' }}>
      <Minecraft3DAltarCanvas {...args} />
    </div>
  )
};
