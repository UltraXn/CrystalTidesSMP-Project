import type { Meta, StoryObj } from '@storybook/react-vite';
import MinecraftAvatar from '../../components/UI/MinecraftAvatar';

const meta = {
  title: 'UI/MinecraftAvatar',
  component: MinecraftAvatar,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0b0c10' },
            { name: 'white', value: '#ffffff' },
        ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'number', min: 32, max: 256, step: 8 } },
    src: { control: 'text' },
  },
} satisfies Meta<typeof MinecraftAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Nickname based (uses mc-heads)
export const Nickname: Story = {
  args: {
    src: 'Notch',
    size: 120,
    alt: 'Notch Avatar',
  },
};

// 2. Direct Skin Texture URL (triggers the crop logic)
export const SkinTexture: Story = {
  args: {
    // Official skin texture example (Steve)
    src: 'http://textures.minecraft.net/texture/344933a2d21124621cba10364c6328394208e82f53488277252033c415392e62',
    size: 120,
    alt: 'Steve Skin Crop',
  },
};

// 3. Regular Image URL (like a discord avatar or uploaded image)
export const RegularImage: Story = {
  args: {
    src: 'https://cdn.discordapp.com/embed/avatars/0.png',
    size: 120,
    alt: 'Discord Default',
  },
};

// 4. Fallback (Invalid/Empty src)
export const Fallback: Story = {
  args: {
    src: '', // Should default to MHF_Steve
    size: 120,
  },
};
