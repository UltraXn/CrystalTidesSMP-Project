import type { Meta, StoryObj } from '@storybook/react';
import { SkinViewer } from '../../components/Launcher/SkinViewer';

const meta: Meta<typeof SkinViewer> = {
  title: 'Launcher/SkinViewer',
  component: SkinViewer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkinViewer>;

export const NeroFernoSkin: Story = {
  args: {
    username: 'NeroFerno',
    style: { width: '260px', height: '380px' }
  }
};

export const SteveSkin: Story = {
  args: {
    username: 'Steve',
    style: { width: '260px', height: '380px' }
  }
};

export const AlexSkinWithCape: Story = {
  args: {
    username: 'Alex',
    capeUrl: 'https://textures.minecraft.net/texture/2340c0e03dd66cd11e16e6acaccc54b080a8bd3c77860d6b8d1297ae7594d23c',
    style: { width: '260px', height: '380px' }
  }
};
