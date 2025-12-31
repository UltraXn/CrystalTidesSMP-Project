
import type { Meta, StoryObj } from '@storybook/react-vite';
import Hero from '../../components/Hero';

const meta = {
  title: 'Home/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => <Story />,
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
