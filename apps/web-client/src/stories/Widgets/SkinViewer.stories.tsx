import type { Meta, StoryObj } from '@storybook/react';
import SkinViewerComponent from '../../components/Widgets/SkinViewer';

const meta: Meta<typeof SkinViewerComponent> = {
  title: 'Widgets/SkinViewer',
  component: SkinViewerComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: { type: 'range', min: 100, max: 600, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 800, step: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof SkinViewerComponent>;

export const Default3DSkinViewer: Story = {
  args: {
    skinUrl: 'https://mc-heads.net/skin/Steve',
    width: 300,
    height: 400,
  },
};

export const CustomPlayerSkin: Story = {
  args: {
    skinUrl: 'https://mc-heads.net/skin/UltraXn',
    width: 350,
    height: 500,
  },
};
