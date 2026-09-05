import type { Meta, StoryObj } from '@storybook/react';
import MinecraftAvatar from '../../components/UI/MinecraftAvatar';

const meta: Meta<typeof MinecraftAvatar> = {
  title: 'UI/MinecraftAvatar',
  component: MinecraftAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    size: { control: { type: 'range', min: 32, max: 256, step: 8 } },
    alt: { control: 'text' },
    fallback: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof MinecraftAvatar>;

export const StevePlayer: Story = {
  args: {
    src: 'Steve',
    size: 120,
    style: { width: '120px', height: '120px', borderRadius: '16px' },
  },
};

export const AlexPlayer: Story = {
  args: {
    src: 'Alex',
    size: 120,
    style: { width: '120px', height: '120px', borderRadius: '16px' },
  },
};

export const CustomPlayerHead: Story = {
  args: {
    src: 'KilluBysmali',
    size: 120,
    style: { width: '120px', height: '120px', borderRadius: '16px', border: '2px solid var(--accent)' },
  },
};

export const SkinTextureRaw64x64: Story = {
  args: {
    src: 'https://textures.minecraft.net/texture/68629f5d4d3e813f8d38865f1ef1e839e944747...png',
    size: 120,
    style: { width: '120px', height: '120px', borderRadius: '16px', border: '2px solid #f59e0b' },
  },
};

export const FallbackOnError: Story = {
  args: {
    src: 'https://invalid-image-domain.com/broken_skin.png',
    fallback: 'https://mc-heads.net/avatar/MHF_Steve',
    size: 120,
    style: { width: '120px', height: '120px', borderRadius: '16px' },
  },
};
