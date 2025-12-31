import type { Meta, StoryObj } from '@storybook/react-vite';
import Loader from '../../components/UI/Loader';

const meta = {
  title: 'UI/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0b0c10' },
        ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'number', min: 20, max: 200, step: 10 } },
    text: { control: 'text' },
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic loader with default text
export const Default: Story = {
  args: {
    text: '', // Falls back to translation default
  },
};

// Custom text
export const CustomText: Story = {
  args: {
    text: 'Loading Diamonds...',
  },
};

// Minimal version (spinner only)
export const Minimal: Story = {
  args: {
    minimal: true,
    size: 40,
  },
};

// Fullscreen loader
export const FullScreen: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    fullScreen: true,
    text: 'Entering world...',
  },
};
