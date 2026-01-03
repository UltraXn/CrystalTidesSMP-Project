import type { Meta, StoryObj } from '@storybook/react';
import Gacha3DShowcase from '../../components/Gacha/Gacha3DShowcase';

const meta = {
  title: 'Gacha/Gacha3DShowcase',
  component: Gacha3DShowcase,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f0f13' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tierColor: { control: 'color' },
    modelUrl: { control: 'text' },
  },
} satisfies Meta<typeof Gacha3DShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

// Bronze Tier
export const Bronze: Story = {
  args: {
    tierColor: '#cd7f32',
  },
};

// Silver Tier
export const Silver: Story = {
  args: {
    tierColor: '#c0c0c0',
  },
};

// Gold Tier
export const Gold: Story = {
  args: {
    tierColor: '#ffd700',
  },
};

// Emerald Tier
export const Emerald: Story = {
  args: {
    tierColor: '#50c878',
  },
};

// Diamond Tier
export const Diamond: Story = {
  args: {
    tierColor: '#00f2ff',
  },
};

// Iridium Tier (Special Shine)
export const Iridium: Story = {
  args: {
    tierColor: '#b150b3', // Triggers magenta shines
  },
};

// Ultra Gem (Special Aura)
export const UltraGem: Story = {
  args: {
    tierColor: '#6366f1', // Triggers purple/indigo aura
  },
};

// With Custom Model (Mock)
export const WithModel: Story = {
    args: {
      tierColor: '#ffd700',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf', // Public sample model for testing
    },
  };
