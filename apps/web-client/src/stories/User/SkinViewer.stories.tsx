import type { Meta, StoryObj } from '@storybook/react';
import SkinViewer from '../../components/User/SkinViewer';

const meta: Meta<typeof SkinViewer> = {
  title: 'User/SkinViewer',
  component: SkinViewer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    username: { control: 'text' },
    width: { control: { type: 'range', min: 100, max: 600, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 800, step: 50 } },
    animation: { control: 'select', options: ['idle', 'walk', 'run', 'fly'] },
  },
};

export default meta;
type Story = StoryObj<typeof SkinViewer>;

export const IdleSteve: Story = {
  args: {
    username: 'Steve',
    width: 300,
    height: 400,
    animation: 'idle',
  },
};

export const WalkingPlayer: Story = {
  args: {
    username: 'UltraXn',
    width: 300,
    height: 400,
    animation: 'walk',
  },
};

export const FlyingPlayer: Story = {
  args: {
    username: 'KilluBysmali',
    width: 350,
    height: 500,
    animation: 'fly',
  },
};
