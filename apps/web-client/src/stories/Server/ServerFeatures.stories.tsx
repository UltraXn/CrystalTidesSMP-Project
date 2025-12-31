
import type { Meta, StoryObj } from '@storybook/react-vite';
import ServerFeatures from '../../components/Home/ServerFeatures';

const meta = {
  title: 'Home/ServerFeatures',
  component: ServerFeatures,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServerFeatures>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
