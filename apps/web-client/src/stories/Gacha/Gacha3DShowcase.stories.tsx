import type { Meta, StoryObj } from '@storybook/react';
import Gacha3DShowcase from '../../components/Gacha/Gacha3DShowcase';

const meta: Meta<typeof Gacha3DShowcase> = {
  title: 'Gacha/Gacha3DShowcase',
  component: Gacha3DShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    tierId: { control: 'select', options: ['common', 'rare', 'epic', 'legendary'] },
    tierColor: { control: 'color' },
    isOpening: { control: 'boolean' },
    isCelebrating: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Gacha3DShowcase>;

export const CommonTierMachine: Story = {
  args: {
    tierId: 'common',
    tierColor: '#94A3B8',
    isOpening: false,
    isCelebrating: false,
  },
};

export const LegendaryTierCelebrating: Story = {
  args: {
    tierId: 'legendary',
    tierColor: '#F59E0B',
    isOpening: false,
    isCelebrating: true,
  },
};

export const EpicTierOpening: Story = {
  args: {
    tierId: 'epic',
    tierColor: '#E879F9',
    isOpening: true,
    isCelebrating: false,
  },
};
