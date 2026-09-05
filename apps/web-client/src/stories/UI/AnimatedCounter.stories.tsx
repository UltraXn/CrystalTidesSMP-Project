import type { Meta, StoryObj } from '@storybook/react';
import AnimatedCounter from '../../components/UI/AnimatedCounter';

const meta: Meta<typeof AnimatedCounter> = {
  title: 'UI/AnimatedCounter',
  component: AnimatedCounter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number' } },
    duration: { control: { type: 'range', min: 200, max: 5000, step: 100 } },
    decimals: { control: { type: 'number', min: 0, max: 4 } },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedCounter>;

export const PlayerCounter: Story = {
  args: {
    value: 1250,
    duration: 1500,
    prefix: '👥 ',
    suffix: ' Jugadores Activos',
  },
};

export const CurrencyValue: Story = {
  args: {
    value: 4999.99,
    duration: 2000,
    decimals: 2,
    prefix: '$',
    suffix: ' USD',
  },
};

export const FastPercentageProgress: Story = {
  args: {
    value: 99.8,
    duration: 800,
    decimals: 1,
    prefix: '⚡ ',
    suffix: '% TPS Eficiencia',
  },
};
